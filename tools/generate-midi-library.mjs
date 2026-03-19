import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const libraryDir = join(rootDir, "library");
const midiDir = join(libraryDir, "midis");

mkdirSync(midiDir, { recursive: true });

const PPQ = 480;

const NOTE_OFFSETS = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

function note(name) {
  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(name);
  if (!match) {
    throw new Error(`Invalid note name: ${name}`);
  }

  const [, pitchClass, octaveText] = match;
  const octave = Number(octaveText);
  return 12 * (octave + 1) + NOTE_OFFSETS[pitchClass];
}

function encodeVarLen(value) {
  let buffer = value & 0x7f;
  const bytes = [];

  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }

  return bytes;
}

function textMeta(delta, type, text) {
  const payload = Buffer.from(text, "utf8");
  return Buffer.from([...encodeVarLen(delta), 0xff, type, ...encodeVarLen(payload.length), ...payload]);
}

function tempoMeta(delta, bpm) {
  const mpqn = Math.round(60000000 / bpm);
  return Buffer.from([
    ...encodeVarLen(delta),
    0xff,
    0x51,
    0x03,
    (mpqn >> 16) & 0xff,
    (mpqn >> 8) & 0xff,
    mpqn & 0xff,
  ]);
}

function endOfTrack(delta = 0) {
  return Buffer.from([...encodeVarLen(delta), 0xff, 0x2f, 0x00]);
}

function noteEvent(delta, status, midi, velocity) {
  return Buffer.from([...encodeVarLen(delta), status, midi, velocity]);
}

function buildSongEvents(song) {
  const events = [
    textMeta(0, 0x03, song.title),
    textMeta(0, 0x04, "Flugel Hero Library"),
    tempoMeta(0, song.bpm),
  ];

  let pendingTicks = 0;

  for (const item of song.sequence) {
    if (item.rest) {
      pendingTicks += Math.round(item.rest * PPQ);
      continue;
    }

    const durationTicks = Math.round(item.duration * PPQ);
    const midi = typeof item.note === "number" ? item.note : note(item.note);
    const velocity = item.velocity ?? 92;

    events.push(noteEvent(pendingTicks, 0x90, midi, velocity));
    events.push(noteEvent(durationTicks, 0x80, midi, 0));
    pendingTicks = 0;
  }

  events.push(endOfTrack(pendingTicks));
  return Buffer.concat(events);
}

function buildMidiFile(song) {
  const header = Buffer.alloc(14);
  header.write("MThd", 0, "ascii");
  header.writeUInt32BE(6, 4);
  header.writeUInt16BE(0, 8);
  header.writeUInt16BE(1, 10);
  header.writeUInt16BE(PPQ, 12);

  const trackData = buildSongEvents(song);
  const trackHeader = Buffer.alloc(8);
  trackHeader.write("MTrk", 0, "ascii");
  trackHeader.writeUInt32BE(trackData.length, 4);

  return Buffer.concat([header, trackHeader, trackData]);
}

function summarizeSong(song) {
  let beatCursor = 0;
  let noteCount = 0;
  const noteValues = [];

  for (const item of song.sequence) {
    if (item.rest) {
      beatCursor += item.rest;
      continue;
    }

    noteCount += 1;
    noteValues.push(typeof item.note === "number" ? item.note : note(item.note));
    beatCursor += item.duration;
  }

  return {
    noteCount,
    durationSeconds: Math.round((beatCursor * 60) / song.bpm),
    lowMidi: Math.min(...noteValues),
    highMidi: Math.max(...noteValues),
  };
}

function toRangeLabel(lowMidi, highMidi) {
  return `${midiToName(lowMidi)}-${midiToName(highMidi)}`;
}

function midiToName(midi) {
  const pitchClasses = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const pitchClass = pitchClasses[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitchClass}${octave}`;
}

const songs = [
  {
    id: "concert-bb-scale",
    title: "Concert Bb Scale",
    subtitle: "Starter scale",
    description: "The default flugelhorn starter drill: up and down concert Bb major with steady note values.",
    difficulty: "Easy",
    color: "sunrise",
    bpm: 88,
    sequence: [
      { note: "Bb3", duration: 1 }, { note: "C4", duration: 1 }, { note: "D4", duration: 1 }, { note: "Eb4", duration: 1 },
      { note: "F4", duration: 1 }, { note: "G4", duration: 1 }, { note: "A4", duration: 1 }, { note: "Bb4", duration: 1.5 },
      { note: "A4", duration: 1 }, { note: "G4", duration: 1 }, { note: "F4", duration: 1 }, { note: "Eb4", duration: 1 },
      { note: "D4", duration: 1 }, { note: "C4", duration: 1 }, { note: "Bb3", duration: 2 },
    ],
  },
  {
    id: "concert-f-scale",
    title: "Concert F Scale",
    subtitle: "Starter scale",
    description: "A comfortable brass range drill that introduces one flat and more upper-register stability.",
    difficulty: "Easy",
    color: "cobalt",
    bpm: 84,
    sequence: [
      { note: "F4", duration: 1 }, { note: "G4", duration: 1 }, { note: "A4", duration: 1 }, { note: "Bb4", duration: 1 },
      { note: "C5", duration: 1 }, { note: "D5", duration: 1 }, { note: "E5", duration: 1 }, { note: "F5", duration: 1.5 },
      { note: "E5", duration: 1 }, { note: "D5", duration: 1 }, { note: "C5", duration: 1 }, { note: "Bb4", duration: 1 },
      { note: "A4", duration: 1 }, { note: "G4", duration: 1 }, { note: "F4", duration: 2 },
    ],
  },
  {
    id: "concert-eb-scale",
    title: "Concert Eb Scale",
    subtitle: "Starter scale",
    description: "A flat-side scale for slotting accuracy and cleaner valve transitions.",
    difficulty: "Easy",
    color: "emerald",
    bpm: 82,
    sequence: [
      { note: "Eb4", duration: 1 }, { note: "F4", duration: 1 }, { note: "G4", duration: 1 }, { note: "Ab4", duration: 1 },
      { note: "Bb4", duration: 1 }, { note: "C5", duration: 1 }, { note: "D5", duration: 1 }, { note: "Eb5", duration: 1.5 },
      { note: "D5", duration: 1 }, { note: "C5", duration: 1 }, { note: "Bb4", duration: 1 }, { note: "Ab4", duration: 1 },
      { note: "G4", duration: 1 }, { note: "F4", duration: 1 }, { note: "Eb4", duration: 2 },
    ],
  },
  {
    id: "concert-ab-scale",
    title: "Concert Ab Scale",
    subtitle: "Flat-side control",
    description: "A slightly denser flat-side scale for learning finger patterns without rushing.",
    difficulty: "Medium",
    color: "violet",
    bpm: 78,
    sequence: [
      { note: "Ab3", duration: 1 }, { note: "Bb3", duration: 1 }, { note: "C4", duration: 1 }, { note: "Db4", duration: 1 },
      { note: "Eb4", duration: 1 }, { note: "F4", duration: 1 }, { note: "G4", duration: 1 }, { note: "Ab4", duration: 1.5 },
      { note: "G4", duration: 1 }, { note: "F4", duration: 1 }, { note: "Eb4", duration: 1 }, { note: "Db4", duration: 1 },
      { note: "C4", duration: 1 }, { note: "Bb3", duration: 1 }, { note: "Ab3", duration: 2 },
    ],
  },
  {
    id: "concert-bb-blues-scale",
    title: "Concert Bb Blues Scale",
    subtitle: "Blues vocabulary",
    description: "A one-octave Bb blues scale up and down for improvisation language, bends, and cleaner slotting on the blue notes.",
    difficulty: "Easy",
    color: "ember",
    bpm: 84,
    sequence: [
      { note: "Bb3", duration: 1 }, { note: "C4", duration: 1 }, { note: "Db4", duration: 1 }, { note: "D4", duration: 1 },
      { note: "F4", duration: 1 }, { note: "G4", duration: 1 }, { note: "Ab4", duration: 1 }, { note: "Bb4", duration: 1.5 },
      { note: "Ab4", duration: 1 }, { note: "G4", duration: 1 }, { note: "F4", duration: 1 }, { note: "D4", duration: 1 },
      { note: "Db4", duration: 1 }, { note: "C4", duration: 1 }, { note: "Bb3", duration: 2 },
    ],
  },
  {
    id: "concert-f-blues-scale",
    title: "Concert F Blues Scale",
    subtitle: "Blues vocabulary",
    description: "A concert F blues scale that keeps the shape compact while drilling the b3, b5, and b7 colors.",
    difficulty: "Easy",
    color: "cobalt",
    bpm: 82,
    sequence: [
      { note: "F4", duration: 1 }, { note: "Ab4", duration: 1 }, { note: "Bb4", duration: 1 }, { note: "B4", duration: 1 },
      { note: "C5", duration: 1 }, { note: "Eb5", duration: 1 }, { note: "F5", duration: 1.5 },
      { note: "Eb5", duration: 1 }, { note: "C5", duration: 1 }, { note: "B4", duration: 1 }, { note: "Bb4", duration: 1 },
      { note: "Ab4", duration: 1 }, { note: "F4", duration: 2 },
    ],
  },
  {
    id: "concert-eb-blues-scale",
    title: "Concert Eb Blues Scale",
    subtitle: "Blues vocabulary",
    description: "A slightly darker flat-side blues scale for building comfort with Gb and the natural 3 against the tonic.",
    difficulty: "Medium",
    color: "emerald",
    bpm: 80,
    sequence: [
      { note: "Eb4", duration: 1 }, { note: "Gb4", duration: 1 }, { note: "Ab4", duration: 1 }, { note: "A4", duration: 1 },
      { note: "Bb4", duration: 1 }, { note: "Db5", duration: 1 }, { note: "Eb5", duration: 1.5 },
      { note: "Db5", duration: 1 }, { note: "Bb4", duration: 1 }, { note: "A4", duration: 1 }, { note: "Ab4", duration: 1 },
      { note: "Gb4", duration: 1 }, { note: "Eb4", duration: 2 },
    ],
  },
  {
    id: "concert-bb-major-pentatonic",
    title: "Concert Bb Major Pentatonic",
    subtitle: "Jazz pentatonic",
    description: "A brass-friendly pentatonic pocket for simple melodic shapes and cleaner jazz vocabulary.",
    difficulty: "Easy",
    color: "sunrise",
    bpm: 86,
    sequence: [
      { note: "Bb3", duration: 1 }, { note: "C4", duration: 1 }, { note: "D4", duration: 1 }, { note: "F4", duration: 1 },
      { note: "G4", duration: 1 }, { note: "Bb4", duration: 1.5 }, { note: "G4", duration: 1 }, { note: "F4", duration: 1 },
      { note: "D4", duration: 1 }, { note: "C4", duration: 1 }, { note: "Bb3", duration: 2 },
    ],
  },
  {
    id: "concert-f-major-pentatonic",
    title: "Concert F Major Pentatonic",
    subtitle: "Jazz pentatonic",
    description: "An easy major pentatonic in a bright key that keeps the line open and lyrical.",
    difficulty: "Easy",
    color: "cobalt",
    bpm: 84,
    sequence: [
      { note: "F4", duration: 1 }, { note: "G4", duration: 1 }, { note: "A4", duration: 1 }, { note: "C5", duration: 1 },
      { note: "D5", duration: 1 }, { note: "F5", duration: 1.5 }, { note: "D5", duration: 1 }, { note: "C5", duration: 1 },
      { note: "A4", duration: 1 }, { note: "G4", duration: 1 }, { note: "F4", duration: 2 },
    ],
  },
  {
    id: "concert-c-minor-pentatonic",
    title: "Concert C Minor Pentatonic",
    subtitle: "Jazz pentatonic",
    description: "A flexible minor pentatonic shape for simple jazz and soul language without too many accidentals.",
    difficulty: "Medium",
    color: "violet",
    bpm: 82,
    sequence: [
      { note: "C4", duration: 1 }, { note: "Eb4", duration: 1 }, { note: "F4", duration: 1 }, { note: "G4", duration: 1 },
      { note: "Bb4", duration: 1 }, { note: "C5", duration: 1.5 }, { note: "Bb4", duration: 1 }, { note: "G4", duration: 1 },
      { note: "F4", duration: 1 }, { note: "Eb4", duration: 1 }, { note: "C4", duration: 2 },
    ],
  },
  {
    id: "concert-g-minor-pentatonic",
    title: "Concert G Minor Pentatonic",
    subtitle: "Jazz pentatonic",
    description: "A darker minor pentatonic that sits well on horn and starts to feel more like improvising than drilling.",
    difficulty: "Medium",
    color: "emerald",
    bpm: 80,
    sequence: [
      { note: "G3", duration: 1 }, { note: "Bb3", duration: 1 }, { note: "C4", duration: 1 }, { note: "D4", duration: 1 },
      { note: "F4", duration: 1 }, { note: "G4", duration: 1.5 }, { note: "F4", duration: 1 }, { note: "D4", duration: 1 },
      { note: "C4", duration: 1 }, { note: "Bb3", duration: 1 }, { note: "G3", duration: 2 },
    ],
  },
  {
    id: "concert-bb-bebop-dominant",
    title: "Concert Bb Bebop Dominant",
    subtitle: "Jazz vocabulary",
    description: "A dominant bebop drill with the major seventh passing tone for more idiomatic jazz lines.",
    difficulty: "Medium",
    color: "ember",
    bpm: 88,
    sequence: [
      { note: "Bb3", duration: 0.85 }, { note: "C4", duration: 0.85 }, { note: "D4", duration: 0.85 }, { note: "Eb4", duration: 0.85 },
      { note: "F4", duration: 0.85 }, { note: "G4", duration: 0.85 }, { note: "Ab4", duration: 0.85 }, { note: "A4", duration: 0.85 },
      { note: "Bb4", duration: 1.25 }, { note: "A4", duration: 0.85 }, { note: "Ab4", duration: 0.85 }, { note: "G4", duration: 0.85 },
      { note: "F4", duration: 0.85 }, { note: "Eb4", duration: 0.85 }, { note: "D4", duration: 0.85 }, { note: "C4", duration: 0.85 },
      { note: "Bb3", duration: 1.75 },
    ],
  },
  {
    id: "concert-c-dorian",
    title: "Concert C Dorian",
    subtitle: "Mode drill",
    description: "A modal minor scale with the natural 6 for cleaner dorian language and ii-mode comfort.",
    difficulty: "Medium",
    color: "cobalt",
    bpm: 84,
    sequence: [
      { note: "C4", duration: 1 }, { note: "D4", duration: 1 }, { note: "Eb4", duration: 1 }, { note: "F4", duration: 1 },
      { note: "G4", duration: 1 }, { note: "A4", duration: 1 }, { note: "Bb4", duration: 1 }, { note: "C5", duration: 1.5 },
      { note: "Bb4", duration: 1 }, { note: "A4", duration: 1 }, { note: "G4", duration: 1 }, { note: "F4", duration: 1 },
      { note: "Eb4", duration: 1 }, { note: "D4", duration: 1 }, { note: "C4", duration: 2 },
    ],
  },
  {
    id: "concert-bb-mixolydian",
    title: "Concert Bb Mixolydian",
    subtitle: "Mode drill",
    description: "A dominant-mode scale for blues heads, V7 language, and cleaner control of the flat 7.",
    difficulty: "Medium",
    color: "sunrise",
    bpm: 86,
    sequence: [
      { note: "Bb3", duration: 1 }, { note: "C4", duration: 1 }, { note: "D4", duration: 1 }, { note: "Eb4", duration: 1 },
      { note: "F4", duration: 1 }, { note: "G4", duration: 1 }, { note: "Ab4", duration: 1 }, { note: "Bb4", duration: 1.5 },
      { note: "Ab4", duration: 1 }, { note: "G4", duration: 1 }, { note: "F4", duration: 1 }, { note: "Eb4", duration: 1 },
      { note: "D4", duration: 1 }, { note: "C4", duration: 1 }, { note: "Bb3", duration: 2 },
    ],
  },
  {
    id: "ii-v-into-bb",
    title: "ii-V Into Bb",
    subtitle: "Jazz cell",
    description: "A short ii-V-I drill in concert Bb that moves through chord tones and lands on a clear tonic resolution.",
    difficulty: "Medium",
    color: "ember",
    bpm: 90,
    sequence: [
      { note: "C4", duration: 1 }, { note: "Eb4", duration: 1 }, { note: "G4", duration: 1 }, { note: "Bb4", duration: 1 },
      { note: "A4", duration: 0.85 }, { note: "G4", duration: 0.85 }, { note: "F4", duration: 0.85 }, { note: "Eb4", duration: 0.85 },
      { note: "D4", duration: 1 }, { note: "F4", duration: 1 }, { note: "Bb4", duration: 1.5 }, { note: "A4", duration: 1 },
      { note: "F4", duration: 1 }, { note: "D4", duration: 1 }, { note: "Bb3", duration: 2 },
    ],
  },
  {
    id: "long-tone-centering",
    title: "Long Tone Centering",
    subtitle: "Practice drill",
    description: "Longer target notes on core concert pitches so you can work on center, air, and steady slotting.",
    difficulty: "Easy",
    color: "sunrise",
    bpm: 72,
    sequence: [
      { note: "Bb3", duration: 2.5 }, { note: "D4", duration: 2.5 }, { note: "F4", duration: 2.5 },
      { note: "Bb4", duration: 3.5 }, { note: "F4", duration: 2.5 }, { note: "D4", duration: 2.5 },
      { note: "Bb3", duration: 3.5 },
    ],
  },
  {
    id: "thirds-ladder",
    title: "Thirds Ladder",
    subtitle: "Practice drill",
    description: "Scale motion in thirds for slotting and interval accuracy without pushing the range too far too fast.",
    difficulty: "Medium",
    color: "emerald",
    bpm: 80,
    sequence: [
      { note: "Bb3", duration: 1 }, { note: "D4", duration: 1 }, { note: "C4", duration: 1 }, { note: "Eb4", duration: 1 },
      { note: "D4", duration: 1 }, { note: "F4", duration: 1 }, { note: "Eb4", duration: 1 }, { note: "G4", duration: 1 },
      { note: "F4", duration: 1 }, { note: "A4", duration: 1 }, { note: "G4", duration: 1 }, { note: "Bb4", duration: 1.5 },
      { note: "A4", duration: 1 }, { note: "F4", duration: 1 }, { note: "G4", duration: 1 }, { note: "Eb4", duration: 1 },
      { note: "F4", duration: 1 }, { note: "D4", duration: 1 }, { note: "Eb4", duration: 1 }, { note: "C4", duration: 1 },
      { note: "D4", duration: 1 }, { note: "Bb3", duration: 2 },
    ],
  },
  {
    id: "bb-arpeggio-slots",
    title: "Bb Arpeggio Slots",
    subtitle: "Practice drill",
    description: "A tonic arpeggio pattern for locking in partial jumps cleanly and hearing the chord shape clearly.",
    difficulty: "Easy",
    color: "ember",
    bpm: 84,
    sequence: [
      { note: "Bb3", duration: 1.25 }, { note: "D4", duration: 1.25 }, { note: "F4", duration: 1.25 }, { note: "Bb4", duration: 1.5 },
      { note: "D5", duration: 1.5 }, { note: "Bb4", duration: 1.25 }, { note: "F4", duration: 1.25 }, { note: "D4", duration: 1.25 },
      { note: "Bb3", duration: 2 },
    ],
  },
  {
    id: "clarke-cell-one",
    title: "Clarke Cell One",
    subtitle: "Practice drill",
    description: "A simple technical cell that forces even fingers and stable pitch while the line keeps moving.",
    difficulty: "Medium",
    color: "cobalt",
    bpm: 88,
    sequence: [
      { note: "Bb3", duration: 0.75 }, { note: "C4", duration: 0.75 }, { note: "D4", duration: 0.75 }, { note: "C4", duration: 0.75 },
      { note: "C4", duration: 0.75 }, { note: "D4", duration: 0.75 }, { note: "Eb4", duration: 0.75 }, { note: "D4", duration: 0.75 },
      { note: "D4", duration: 0.75 }, { note: "Eb4", duration: 0.75 }, { note: "F4", duration: 0.75 }, { note: "Eb4", duration: 0.75 },
      { note: "Eb4", duration: 0.75 }, { note: "F4", duration: 0.75 }, { note: "G4", duration: 0.75 }, { note: "F4", duration: 0.75 },
      { note: "F4", duration: 0.75 }, { note: "G4", duration: 0.75 }, { note: "A4", duration: 0.75 }, { note: "G4", duration: 0.75 },
      { note: "G4", duration: 0.75 }, { note: "A4", duration: 0.75 }, { note: "Bb4", duration: 0.75 }, { note: "A4", duration: 0.75 },
      { note: "Bb4", duration: 1.5 }, { note: "G4", duration: 1 }, { note: "Eb4", duration: 1 }, { note: "Bb3", duration: 2 },
    ],
  },
  {
    id: "chromatic-builder",
    title: "Chromatic Builder",
    subtitle: "Valve pattern drill",
    description: "Half-step motion for tuning and finger coordination. Useful in wait mode.",
    difficulty: "Medium",
    color: "aurora",
    bpm: 76,
    sequence: [
      { note: "C4", duration: 0.75 }, { note: "C#4", duration: 0.75 }, { note: "D4", duration: 0.75 }, { note: "Eb4", duration: 0.75 },
      { note: "E4", duration: 0.75 }, { note: "F4", duration: 0.75 }, { note: "F#4", duration: 0.75 }, { note: "G4", duration: 0.75 },
      { note: "Ab4", duration: 0.75 }, { note: "A4", duration: 0.75 }, { note: "Bb4", duration: 0.75 }, { note: "B4", duration: 0.75 },
      { note: "C5", duration: 1.25 },
      { note: "B4", duration: 0.75 }, { note: "Bb4", duration: 0.75 }, { note: "A4", duration: 0.75 }, { note: "Ab4", duration: 0.75 },
      { note: "G4", duration: 0.75 }, { note: "F#4", duration: 0.75 }, { note: "F4", duration: 0.75 }, { note: "E4", duration: 0.75 },
      { note: "Eb4", duration: 0.75 }, { note: "D4", duration: 0.75 }, { note: "C#4", duration: 0.75 }, { note: "C4", duration: 1.5 },
    ],
  },
  {
    id: "warmup-ladder",
    title: "Warm-Up Ladder",
    subtitle: "Long tones and stepwise movement",
    description: "An easy concert-pitch warm-up for testing mic setup and centering the horn on simple note changes.",
    difficulty: "Easy",
    color: "sunrise",
    bpm: 88,
    sequence: [
      { note: "C4", duration: 2 },
      { note: "D4", duration: 2 },
      { note: "E4", duration: 2 },
      { note: "F4", duration: 2 },
      { note: "G4", duration: 2 },
      { note: "A4", duration: 2 },
      { note: "G4", duration: 2 },
      { note: "F4", duration: 2 },
      { note: "E4", duration: 2 },
      { note: "D4", duration: 2 },
      { note: "C4", duration: 3 },
    ],
  },
  {
    id: "ode-to-joy",
    title: "Ode to Joy",
    subtitle: "Public-domain melody",
    description: "A familiar line with repeated notes and short phrases. Good for first real runs.",
    difficulty: "Easy",
    color: "cobalt",
    bpm: 104,
    sequence: [
      { note: "E4", duration: 1 }, { note: "E4", duration: 1 }, { note: "F4", duration: 1 }, { note: "G4", duration: 1 },
      { note: "G4", duration: 1 }, { note: "F4", duration: 1 }, { note: "E4", duration: 1 }, { note: "D4", duration: 1 },
      { note: "C4", duration: 1 }, { note: "C4", duration: 1 }, { note: "D4", duration: 1 }, { note: "E4", duration: 1 },
      { note: "E4", duration: 1.5 }, { note: "D4", duration: 0.5 }, { note: "D4", duration: 2 },
      { note: "E4", duration: 1 }, { note: "E4", duration: 1 }, { note: "F4", duration: 1 }, { note: "G4", duration: 1 },
      { note: "G4", duration: 1 }, { note: "F4", duration: 1 }, { note: "E4", duration: 1 }, { note: "D4", duration: 1 },
      { note: "C4", duration: 1 }, { note: "C4", duration: 1 }, { note: "D4", duration: 1 }, { note: "E4", duration: 1 },
      { note: "D4", duration: 1.5 }, { note: "C4", duration: 0.5 }, { note: "C4", duration: 2 },
    ],
  },
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    subtitle: "Public-domain hymn",
    description: "Longer breaths and slower targets. Useful when you want less visual chaos and more pitch stability work.",
    difficulty: "Easy",
    color: "emerald",
    bpm: 72,
    sequence: [
      { note: "G4", duration: 1.5 }, { note: "C5", duration: 3 }, { note: "E5", duration: 1.5 }, { note: "C5", duration: 3 },
      { note: "E5", duration: 1.5 }, { note: "D5", duration: 1.5 }, { note: "C5", duration: 3 }, { note: "A4", duration: 1.5 },
      { note: "G4", duration: 3 },
      { note: "G4", duration: 1.5 }, { note: "C5", duration: 3 }, { note: "E5", duration: 1.5 }, { note: "C5", duration: 3 },
      { note: "E5", duration: 1.5 }, { note: "D5", duration: 1.5 }, { note: "G5", duration: 3 }, { note: "E5", duration: 1.5 },
      { note: "C5", duration: 3 },
    ],
  },
  {
    id: "saints-go-marching",
    title: "When the Saints",
    subtitle: "Public-domain New Orleans standard",
    description: "Bouncy phrasing with a stronger pulse. Better once the pitch lane already feels natural.",
    difficulty: "Medium",
    color: "ember",
    bpm: 116,
    sequence: [
      { note: "C4", duration: 1 }, { note: "E4", duration: 1 }, { note: "F4", duration: 1 }, { note: "G4", duration: 1 },
      { note: "C5", duration: 2 }, { rest: 1 },
      { note: "C4", duration: 1 }, { note: "E4", duration: 1 }, { note: "F4", duration: 1 }, { note: "G4", duration: 1 },
      { note: "C5", duration: 2 }, { rest: 1 },
      { note: "E5", duration: 1 }, { note: "D5", duration: 1 }, { note: "C5", duration: 1 }, { note: "A4", duration: 1 },
      { note: "G4", duration: 2 }, { rest: 1 },
      { note: "C4", duration: 1 }, { note: "E4", duration: 1 }, { note: "F4", duration: 1 }, { note: "G4", duration: 1 },
      { note: "C5", duration: 3 },
    ],
  },
  {
    id: "greensleeves",
    title: "Greensleeves",
    subtitle: "Public-domain folk tune",
    description: "A smoother lyrical melody with a wider range and more shape than the beginner tunes.",
    difficulty: "Medium",
    color: "violet",
    bpm: 84,
    sequence: [
      { note: "A4", duration: 2 }, { note: "C5", duration: 1 }, { note: "D5", duration: 1 }, { note: "E5", duration: 2 },
      { note: "F5", duration: 1 }, { note: "E5", duration: 1 }, { note: "D5", duration: 2 }, { note: "B4", duration: 1 },
      { note: "G4", duration: 1 }, { note: "A4", duration: 2 },
      { note: "A4", duration: 2 }, { note: "C5", duration: 1 }, { note: "D5", duration: 1 }, { note: "E5", duration: 2 },
      { note: "F5", duration: 1 }, { note: "E5", duration: 1 }, { note: "D5", duration: 2 }, { note: "B4", duration: 1 },
      { note: "G4", duration: 1 }, { note: "A4", duration: 2 },
    ],
  },
  {
    id: "interval-builder",
    title: "Interval Builder",
    subtitle: "Custom brass study",
    description: "A generated practice chart that alternates thirds, fourths, and returns to center. Good for slotting accuracy.",
    difficulty: "Medium",
    color: "aurora",
    bpm: 96,
    sequence: [
      { note: "Bb3", duration: 1.5 }, { note: "D4", duration: 1.5 }, { note: "Bb3", duration: 1.5 }, { note: "Eb4", duration: 1.5 },
      { note: "Bb3", duration: 1.5 }, { note: "F4", duration: 1.5 }, { note: "D4", duration: 1.5 }, { note: "G4", duration: 1.5 },
      { note: "E4", duration: 1.5 }, { note: "A4", duration: 1.5 }, { note: "F4", duration: 1.5 }, { note: "Bb4", duration: 1.5 },
      { note: "G4", duration: 1.5 }, { note: "D5", duration: 1.5 }, { note: "Bb4", duration: 2.5 }, { note: "F4", duration: 2.5 },
    ],
  },
];

const manifest = songs.map((song) => {
  const midiFileName = `${song.id}.mid`;
  const midiPath = join(midiDir, midiFileName);
  writeFileSync(midiPath, buildMidiFile(song));

  const summary = summarizeSong(song);

  return {
    id: song.id,
    title: song.title,
    subtitle: song.subtitle,
    description: song.description,
    difficulty: song.difficulty,
    bpm: song.bpm,
    durationSeconds: summary.durationSeconds,
    noteCount: summary.noteCount,
    noteRange: toRangeLabel(summary.lowMidi, summary.highMidi),
    color: song.color,
    midiPath: `./library/midis/${midiFileName}`,
    source: "Built-in Library",
  };
});

writeFileSync(join(libraryDir, "songs.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated ${manifest.length} MIDI files in ${midiDir}`);
