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
