const elements = {
  loadWarmupBtn: document.getElementById("loadWarmupBtn"),
  librarySection: document.getElementById("librarySection"),
  libraryGrid: document.getElementById("libraryGrid"),
  libraryStatus: document.getElementById("libraryStatus"),
  midiInput: document.getElementById("midiInput"),
  audioInput: document.getElementById("audioInput"),
  trackSelectWrap: document.getElementById("trackSelectWrap"),
  trackSelect: document.getElementById("trackSelect"),
  viewLaneBtn: document.getElementById("viewLaneBtn"),
  viewStaffBtn: document.getElementById("viewStaffBtn"),
  modeFlowBtn: document.getElementById("modeFlowBtn"),
  modeStepBtn: document.getElementById("modeStepBtn"),
  sessionChartBtn: document.getElementById("sessionChartBtn"),
  sessionKeyBtn: document.getElementById("sessionKeyBtn"),
  keyLockBlock: document.getElementById("keyLockBlock"),
  keyRootSelect: document.getElementById("keyRootSelect"),
  keyPaletteSelect: document.getElementById("keyPaletteSelect"),
  randomKeyBtn: document.getElementById("randomKeyBtn"),
  resetKeyModeBtn: document.getElementById("resetKeyModeBtn"),
  transposeSelect: document.getElementById("transposeSelect"),
  toleranceSelect: document.getElementById("toleranceSelect"),
  micButton: document.getElementById("micButton"),
  startButton: document.getElementById("startButton"),
  stopButton: document.getElementById("stopButton"),
  playControlsRow: document.getElementById("playControlsRow"),
  nextActionText: document.getElementById("nextActionText"),
  selectedSongTitle: document.getElementById("selectedSongTitle"),
  selectedSongDetail: document.getElementById("selectedSongDetail"),
  selectedSourceTag: document.getElementById("selectedSourceTag"),
  selectedDifficultyTag: document.getElementById("selectedDifficultyTag"),
  selectedRangeTag: document.getElementById("selectedRangeTag"),
  selectedDurationTag: document.getElementById("selectedDurationTag"),
  detectedNote: document.getElementById("detectedNote"),
  detectedFrequency: document.getElementById("detectedFrequency"),
  detectedCents: document.getElementById("detectedCents"),
  detectedClarity: document.getElementById("detectedClarity"),
  stageTitle: document.getElementById("stageTitle"),
  sessionStatus: document.getElementById("sessionStatus"),
  liveTargetNote: document.getElementById("liveTargetNote"),
  liveTargetHz: document.getElementById("liveTargetHz"),
  targetPitchMeta: document.getElementById("targetPitchMeta"),
  targetFingeringLabel: document.getElementById("targetFingeringLabel"),
  targetValve1: document.getElementById("targetValve1"),
  targetValve2: document.getElementById("targetValve2"),
  targetValve3: document.getElementById("targetValve3"),
  hearTargetBtn: document.getElementById("hearTargetBtn"),
  livePlayerNote: document.getElementById("livePlayerNote"),
  livePlayerHz: document.getElementById("livePlayerHz"),
  scoreValue: document.getElementById("scoreValue"),
  streakValue: document.getElementById("streakValue"),
  accuracyValue: document.getElementById("accuracyValue"),
  notesValue: document.getElementById("notesValue"),
  songMeta: document.getElementById("songMeta"),
  timeMeta: document.getElementById("timeMeta"),
  overlayPrimary: document.getElementById("overlayPrimary"),
  overlaySecondary: document.getElementById("overlaySecondary"),
  canvas: document.getElementById("gameCanvas"),
};

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const NOTE_COLORS = [
  "#ffd483",
  "#ffbf6a",
  "#f3e37a",
  "#c6f16e",
  "#8af2dd",
  "#7dc7ff",
  "#99b5ff",
  "#c2a0ff",
  "#ff97d1",
  "#ff9c8f",
  "#ffc4a9",
  "#f1d8a5",
];
const STUDIO_COLORS = {
  canvasBg: "#03070c",
  canvasBgRaised: "#08101a",
  surfaceInk: "#05090f",
  rail: "#0b1220",
  gridStrong: "rgba(248, 250, 252, 0.12)",
  gridWeak: "rgba(248, 250, 252, 0.04)",
  gridStaff: "rgba(248, 250, 252, 0.16)",
  text: "#f8fafc",
  muted: "#94a3b8",
  gold: "#ffcc66",
  goldSoft: "rgba(255, 204, 102, 0.78)",
  goldGlow: "rgba(255, 204, 102, 0.38)",
  teal: "#7df2df",
  tealGlow: "rgba(125, 242, 223, 0.34)",
  sky: "#8ac8ff",
  skyGlow: "rgba(138, 200, 255, 0.4)",
  rose: "#ff8f93",
  roseGlow: "rgba(255, 143, 147, 0.34)",
};
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
const PITCH_DETECTION = {
  minFrequency: 110,
  maxFrequency: 1200,
  rmsFloor: 0.01,
  yinThreshold: 0.12,
  periodicityFloor: 0.48,
  octaveAnchorDistance: 2.5,
  octaveImprovement: 3.5,
  unstableJumpSemitones: 6,
  unstableJumpClarity: 0.32,
  analysisLowpassHz: 1800,
  analysisHighpassHz: 110,
};
const BB_HORN_FINGERINGS = {
  A3: [1, 2],
  Bb3: [1],
  B3: [2],
  C4: [],
  "C#4": [1, 2, 3],
  Db4: [1, 2, 3],
  D4: [1, 3],
  "D#4": [2, 3],
  Eb4: [2, 3],
  E4: [1, 2],
  F4: [1],
  "F#4": [2],
  Gb4: [2],
  G4: [],
  "G#4": [2, 3],
  Ab4: [2, 3],
  A4: [1, 2],
  Bb4: [1],
  B4: [2],
  C5: [],
  "C#5": [1, 2],
  Db5: [1, 2],
  D5: [1],
  "D#5": [2],
  Eb5: [2],
  E5: [],
  F5: [1],
  "F#5": [2],
  Gb5: [2],
  G5: [],
  "G#5": [2, 3],
  Ab5: [2, 3],
  A5: [1, 2],
  Bb5: [1],
  B5: [2],
  C6: [],
};
const KEY_RENDER_RANGE = {
  minMidi: 50,
  maxMidi: 82,
};
const KEY_PALETTES = [
  {
    id: "majorPentatonic",
    label: "Major Pentatonic",
    shortLabel: "Maj Pent",
    intervals: [0, 2, 4, 7, 9],
  },
  {
    id: "minorPentatonic",
    label: "Minor Pentatonic",
    shortLabel: "Min Pent",
    intervals: [0, 3, 5, 7, 10],
  },
  {
    id: "mixolydian",
    label: "Mixolydian",
    shortLabel: "Mixolyd",
    intervals: [0, 2, 4, 5, 7, 9, 10],
  },
  {
    id: "dorian",
    label: "Dorian",
    shortLabel: "Dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10],
  },
  {
    id: "bebopDominant",
    label: "Bebop Dominant",
    shortLabel: "Bebop",
    intervals: [0, 2, 4, 5, 7, 9, 10, 11],
  },
  {
    id: "blues",
    label: "Blues",
    shortLabel: "Blues",
    intervals: [0, 3, 5, 6, 7, 10],
  },
];
const EMBEDDED_LIBRARY_DEFINITIONS = [
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
];

const LIBRARY_MANIFEST_PATH = "./library/songs.json";

const state = {
  library: [],
  selectedLibrarySongId: null,
  selection: null,
  practiceContext: "chart",
  tracks: [],
  selectedTrackKey: "",
  activeTrackLabel: "",
  chart: [],
  chartBaseNotes: [],
  chartReady: false,
  chartDurationMs: 0,
  chartName: "",
  chartSource: "",
  viewMode: "lane",
  progressionMode: "flow",
  transpose: 0,
  toleranceCents: 35,
  renderMinMidi: 55,
  renderMaxMidi: 72,
  audioFileName: "",
  pendingAudioFile: null,
  backingBuffer: null,
  backingSource: null,
  running: false,
  songStartPerfMs: 0,
  countInMs: 2200,
  currentSongTimeMs: 0,
  frameHandle: 0,
  lastFrameMs: 0,
  stepJustReset: false,
  score: null,
  pitch: {
    frequency: null,
    midiFloat: null,
    midiRounded: null,
    cents: null,
    clarity: 0,
    amplitude: 0,
  },
  audioContext: null,
  analyser: null,
  micSource: null,
  micHighpassFilter: null,
  micLowpassFilter: null,
  micStream: null,
  micReady: false,
  timeDomainBuffer: null,
  pitchWorkBuffer: null,
  pitchDifferenceBuffer: null,
  noteHitRegions: [],
  hoveredCanvasNoteIndex: null,
  keyMode: {
    rootPc: NOTE_OFFSETS.Bb,
    paletteId: "majorPentatonic",
    stats: {
      events: 0,
      hits: 0,
      misses: 0,
      streak: 0,
      candidateMidi: null,
      candidateFrames: 0,
      lastEventSignature: "",
      lastJudgement: null,
      lastNoteLabel: "--",
    },
  },
};

const canvasContext = elements.canvas.getContext("2d");
const TREBLE_BOTTOM_LINE_STEP = 4 * 7 + 2;
const STAFF_LETTER_STEPS = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatClockMs(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatFrequencyLabel(frequency) {
  return Number.isFinite(frequency) ? `${frequency.toFixed(1)} Hz` : "-- Hz";
}

function mod12(value) {
  return ((value % 12) + 12) % 12;
}

function getPitchClassName(pitchClass) {
  return NOTE_NAMES[mod12(pitchClass)];
}

function getKeyPalette(paletteId = state.keyMode.paletteId) {
  return KEY_PALETTES.find((palette) => palette.id === paletteId) || KEY_PALETTES[0];
}

function getKeyModeLabel({ short = false } = {}) {
  const palette = getKeyPalette();
  return `${getPitchClassName(state.keyMode.rootPc)} ${short ? palette.shortLabel : palette.label}`;
}

function getKeyModeAllowedPitchClasses() {
  const palette = getKeyPalette();
  return palette.intervals.map((interval) => mod12(state.keyMode.rootPc + interval));
}

function getKeyModeAllowedNoteNames() {
  return getKeyModeAllowedPitchClasses().map(getPitchClassName);
}

function getKeyModeRootMidi() {
  let midi = 60 + mod12(state.keyMode.rootPc);
  if (midi > 70) {
    midi -= 12;
  }
  if (midi < 55) {
    midi += 12;
  }
  return midi;
}

function getNearestAllowedMidi(midi) {
  if (!Number.isFinite(midi)) {
    return null;
  }

  const allowedPitchClasses = new Set(getKeyModeAllowedPitchClasses());
  let bestMidi = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  const roundedMidi = Math.round(midi);

  for (let candidate = roundedMidi - 12; candidate <= roundedMidi + 12; candidate += 1) {
    if (!allowedPitchClasses.has(mod12(candidate))) {
      continue;
    }

    const distance = Math.abs(candidate - midi);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMidi = candidate;
    }
  }

  return bestMidi;
}

function isKeyModePitchAllowed(midi) {
  return Number.isFinite(midi) && getKeyModeAllowedPitchClasses().includes(mod12(Math.round(midi)));
}

function resetKeyModeStats() {
  state.keyMode.stats = {
    events: 0,
    hits: 0,
    misses: 0,
    streak: 0,
    candidateMidi: null,
    candidateFrames: 0,
    lastEventSignature: "",
    lastJudgement: null,
    lastNoteLabel: "--",
  };
}

function syncRenderRange() {
  if (state.practiceContext === "key") {
    state.renderMinMidi = KEY_RENDER_RANGE.minMidi;
    state.renderMaxMidi = KEY_RENDER_RANGE.maxMidi;
    return;
  }

  const noteValues = state.chart.map((note) => note.targetMidi);
  state.renderMinMidi = noteValues.length ? Math.floor(Math.min(...noteValues)) - 1 : 55;
  state.renderMaxMidi = noteValues.length ? Math.ceil(Math.max(...noteValues)) + 1 : 72;
}

function setPracticeContext(context, { resetKeyStats = false, statusMessage = "" } = {}) {
  state.practiceContext = context;

  if (context === "key") {
    state.running = false;
    state.currentSongTimeMs = 0;
    state.stepJustReset = false;
    state.viewMode = "lane";
    state.selectedLibrarySongId = null;
    if (resetKeyStats) {
      resetKeyModeStats();
    }
  } else {
    state.selectedLibrarySongId = state.selection?.kind === "library" ? state.selection.id : null;
  }

  renderLibrary();
  syncRenderRange();
  updateScoreboard();
  updateSelectedSongCard();
  updateWorkflowUI();
  updateLiveHud();
  drawScene(state.currentSongTimeMs);

  if (statusMessage) {
    setSessionStatus(statusMessage);
  }
}

function getKeyModeCoachMessage() {
  if (!state.micReady) {
    return "Enable the microphone, then improvise inside the key.";
  }

  if (!Number.isFinite(state.pitch.midiRounded)) {
    return `Only play ${getKeyModeAllowedNoteNames().join(" ")}.`;
  }

  const currentNote = midiToNoteName(state.pitch.midiRounded);
  if (isKeyModePitchAllowed(state.pitch.midiRounded)) {
    return `${currentNote} is in the key. Keep the line moving.`;
  }

  const nearestAllowedMidi = getNearestAllowedMidi(state.pitch.midiFloat ?? state.pitch.midiRounded);
  return nearestAllowedMidi
    ? `${currentNote} is outside. Resolve toward ${midiToNoteName(nearestAllowedMidi)}.`
    : `${currentNote} is outside the key.`;
}

function updateKeyModeTracking() {
  const stats = state.keyMode.stats;

  if (!state.micReady || !Number.isFinite(state.pitch.midiRounded) || state.pitch.clarity < 0.24) {
    stats.candidateMidi = null;
    stats.candidateFrames = 0;
    stats.lastEventSignature = "";
    return;
  }

  if (stats.candidateMidi === state.pitch.midiRounded) {
    stats.candidateFrames += 1;
  } else {
    stats.candidateMidi = state.pitch.midiRounded;
    stats.candidateFrames = 1;
  }

  if (stats.candidateFrames < 3) {
    return;
  }

  const signature = String(state.pitch.midiRounded);
  if (stats.lastEventSignature === signature) {
    return;
  }

  stats.lastEventSignature = signature;
  stats.events += 1;
  stats.lastNoteLabel = midiToNoteName(state.pitch.midiRounded);

  if (isKeyModePitchAllowed(state.pitch.midiRounded)) {
    stats.hits += 1;
    stats.streak += 1;
    stats.lastJudgement = "in";
  } else {
    stats.misses += 1;
    stats.streak = 0;
    stats.lastJudgement = "out";
  }

  updateScoreboard();
}

function midiToNoteName(midi) {
  const rounded = Math.round(midi);
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${name}${octave}`;
}

function splitNoteName(midi) {
  const match = /^([A-G])([#b]?)(-?\d+)$/.exec(midiToNoteName(midi));
  if (!match) {
    return { letter: "C", accidental: "", octave: 4 };
  }

  return {
    letter: match[1],
    accidental: match[2],
    octave: Number(match[3]),
  };
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getAudioContextCtor() {
  return window.AudioContext || window.webkitAudioContext || null;
}

async function getSharedAudioContext() {
  if (!state.audioContext) {
    const AudioContextCtor = getAudioContextCtor();
    if (!AudioContextCtor) {
      throw new Error("Web Audio is not supported in this browser.");
    }

    state.audioContext = new AudioContextCtor();
  }

  if (state.audioContext.state === "suspended") {
    await state.audioContext.resume();
  }

  return state.audioContext;
}

function noteNameToMidi(name) {
  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(name);
  if (!match) {
    throw new Error(`Invalid note name: ${name}`);
  }

  const [, pitchClass, octaveText] = match;
  const octave = Number(octaveText);
  const offset = NOTE_OFFSETS[pitchClass];
  if (!Number.isFinite(offset)) {
    throw new Error(`Unsupported pitch class: ${pitchClass}`);
  }

  return 12 * (octave + 1) + offset;
}

function frequencyToMidi(frequency) {
  return 69 + 12 * Math.log2(frequency / 440);
}

function ensurePitchBuffers(length) {
  if (!state.pitchWorkBuffer || state.pitchWorkBuffer.length !== length) {
    state.pitchWorkBuffer = new Float32Array(length);
  }

  if (!state.pitchDifferenceBuffer || state.pitchDifferenceBuffer.length !== length) {
    state.pitchDifferenceBuffer = new Float32Array(length);
  }
}

function preparePitchAnalysisBuffer(buffer) {
  ensurePitchBuffers(buffer.length);

  const workBuffer = state.pitchWorkBuffer;
  const lastIndex = Math.max(1, buffer.length - 1);
  let mean = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    mean += buffer[index];
  }
  mean /= buffer.length;

  let amplitudeSum = 0;
  for (let index = 0; index < buffer.length; index += 1) {
    const centered = buffer[index] - mean;
    amplitudeSum += centered * centered;

    const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / lastIndex);
    workBuffer[index] = centered * window;
  }

  return {
    analysisBuffer: workBuffer,
    rms: Math.sqrt(amplitudeSum / buffer.length),
  };
}

function interpolateBufferValue(buffer, index) {
  const leftIndex = Math.floor(index);
  const rightIndex = Math.min(buffer.length - 1, leftIndex + 1);

  if (leftIndex === rightIndex) {
    return buffer[leftIndex];
  }

  const fraction = index - leftIndex;
  return buffer[leftIndex] * (1 - fraction) + buffer[rightIndex] * fraction;
}

function refineParabolicMinimum(buffer, index) {
  const previous = buffer[index - 1] ?? buffer[index];
  const current = buffer[index];
  const next = buffer[index + 1] ?? buffer[index];
  const denominator = previous + next - 2 * current;

  if (Math.abs(denominator) < 1e-9) {
    return index;
  }

  return index + (previous - next) / (2 * denominator);
}

function detectPitchYin(buffer, sampleRate) {
  const minLag = Math.max(2, Math.floor(sampleRate / PITCH_DETECTION.maxFrequency));
  const maxLag = Math.min(Math.floor(sampleRate / PITCH_DETECTION.minFrequency), buffer.length - 2);
  if (maxLag <= minLag + 2) {
    return null;
  }

  const yinBuffer = state.pitchDifferenceBuffer;
  let runningSum = 0;
  let bestTau = -1;
  let bestValue = Number.POSITIVE_INFINITY;

  yinBuffer[0] = 1;
  yinBuffer[1] = 1;

  for (let tau = 1; tau <= maxLag; tau += 1) {
    let difference = 0;

    for (let index = 0; index < buffer.length - tau; index += 1) {
      const delta = buffer[index] - buffer[index + tau];
      difference += delta * delta;
    }

    runningSum += difference;

    if (tau < minLag || runningSum <= 0) {
      yinBuffer[tau] = 1;
      continue;
    }

    const normalizedDifference = (difference * tau) / runningSum;
    yinBuffer[tau] = normalizedDifference;

    if (normalizedDifference < bestValue) {
      bestValue = normalizedDifference;
      bestTau = tau;
    }
  }

  let tauEstimate = -1;
  for (let tau = minLag; tau <= maxLag; tau += 1) {
    if (yinBuffer[tau] >= PITCH_DETECTION.yinThreshold) {
      continue;
    }

    while (tau + 1 <= maxLag && yinBuffer[tau + 1] <= yinBuffer[tau]) {
      tau += 1;
    }

    tauEstimate = tau;
    break;
  }

  if (tauEstimate === -1) {
    if (bestTau === -1 || bestValue > 1 - PITCH_DETECTION.periodicityFloor) {
      return null;
    }
    tauEstimate = bestTau;
  }

  const refinedTau = clamp(refineParabolicMinimum(yinBuffer, tauEstimate), minLag, maxLag);
  const yinValue = interpolateBufferValue(yinBuffer, refinedTau);
  const periodicity = clamp(1 - yinValue, 0, 1);

  if (periodicity < PITCH_DETECTION.periodicityFloor) {
    return null;
  }

  return {
    frequency: sampleRate / refinedTau,
    periodicity,
  };
}

function getPitchAnchorMidi() {
  const referenceMidi = state.running ? getActiveWindowNote(state.currentSongTimeMs)?.targetMidi : null;
  if (Number.isFinite(referenceMidi)) {
    return referenceMidi;
  }

  return Number.isFinite(state.pitch.midiFloat) ? state.pitch.midiFloat : null;
}

function resolveBrassHarmonicAlias(frequency, periodicity) {
  const anchorMidi = getPitchAnchorMidi();
  if (!Number.isFinite(anchorMidi)) {
    return frequency;
  }

  const candidates = [frequency, frequency / 2, frequency / 3, frequency * 2]
    .filter((candidateFrequency, index, all) => (
      candidateFrequency >= PITCH_DETECTION.minFrequency &&
      candidateFrequency <= PITCH_DETECTION.maxFrequency &&
      all.findIndex((value) => Math.abs(value - candidateFrequency) < 1e-6) === index
    ))
    .map((candidateFrequency) => ({
      frequency: candidateFrequency,
      midi: frequencyToMidi(candidateFrequency),
    }));

  const baseCandidate = candidates.find((candidate) => Math.abs(candidate.frequency - frequency) < 1e-6) || candidates[0];
  const bestCandidate = candidates.reduce((best, candidate) => (
    Math.abs(candidate.midi - anchorMidi) < Math.abs(best.midi - anchorMidi) ? candidate : best
  ), baseCandidate);

  const baseDistance = Math.abs(baseCandidate.midi - anchorMidi);
  const bestDistance = Math.abs(bestCandidate.midi - anchorMidi);

  if (
    bestCandidate !== baseCandidate &&
    bestDistance <= PITCH_DETECTION.octaveAnchorDistance &&
    baseDistance - bestDistance >= PITCH_DETECTION.octaveImprovement &&
    periodicity < 0.95
  ) {
    return bestCandidate.frequency;
  }

  return frequency;
}

function prettifyFileName(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function summarizeSequence(song) {
  let beatCursor = 0;
  let noteCount = 0;
  const noteValues = [];

  for (const item of song.sequence) {
    if (item.rest) {
      beatCursor += item.rest;
      continue;
    }

    noteCount += 1;
    noteValues.push(typeof item.note === "number" ? item.note : noteNameToMidi(item.note));
    beatCursor += item.duration;
  }

  return {
    noteCount,
    durationSeconds: Math.round((beatCursor * 60) / song.bpm),
    lowMidi: Math.min(...noteValues),
    highMidi: Math.max(...noteValues),
  };
}

function buildNotesFromSequence(sequence, bpm) {
  let beatCursor = 0;
  const beatMs = 60000 / bpm;
  const notes = [];

  for (const item of sequence) {
    if (item.rest) {
      beatCursor += item.rest;
      continue;
    }

    const startMs = beatCursor * beatMs;
    const durationMs = item.duration * beatMs;
    notes.push({
      startMs,
      endMs: startMs + durationMs,
      midi: typeof item.note === "number" ? item.note : noteNameToMidi(item.note),
      velocity: item.velocity ?? 92,
      channel: 0,
    });
    beatCursor += item.duration;
  }

  return notes;
}

function cloneTracks(tracks) {
  return tracks.map((track) => ({
    ...track,
    notes: track.notes.map((note) => ({ ...note })),
  }));
}

function createEmbeddedLibrarySong(song) {
  const notes = buildNotesFromSequence(song.sequence, song.bpm);
  const summary = summarizeSequence(song);

  return {
    id: song.id,
    title: song.title,
    subtitle: song.subtitle,
    description: song.description,
    difficulty: song.difficulty,
    bpm: song.bpm,
    durationSeconds: summary.durationSeconds,
    noteCount: summary.noteCount,
    noteRange: `${midiToNoteName(summary.lowMidi)}-${midiToNoteName(summary.highMidi)}`,
    color: song.color,
    source: "Embedded Starter Library",
    midiPath: null,
    embeddedTracks: [
      {
        key: "track-0",
        label: `${song.title} • Embedded Chart • ${notes.length} notes`,
        notes,
      },
    ],
  };
}

const EMBEDDED_LIBRARY = EMBEDDED_LIBRARY_DEFINITIONS.map(createEmbeddedLibrarySong);
const EMBEDDED_LIBRARY_BY_ID = new Map(EMBEDDED_LIBRARY.map((song) => [song.id, song]));

function setLibraryStatus(message) {
  elements.libraryStatus.textContent = message;
}

function setSessionStatus(message) {
  elements.sessionStatus.textContent = message;
}

function getChartDurationLabel() {
  return state.chartReady ? formatClockMs(Math.max(0, state.chartDurationMs - 1200)) : "--";
}

function getChartRangeLabel() {
  if (!state.chart.length) {
    return "--";
  }

  const values = state.chart.map((note) => note.targetMidi);
  return `${midiToNoteName(Math.min(...values))}-${midiToNoteName(Math.max(...values))}`;
}

function getReferenceNote(songTimeMs = state.currentSongTimeMs) {
  if (state.practiceContext === "key") {
    return null;
  }
  return state.chart.find((note) => !note.judged && note.endMs >= songTimeMs - 80) || null;
}

function getTargetPreviewNote(songTimeMs = state.currentSongTimeMs) {
  if (state.practiceContext === "key") {
    return {
      targetMidi: getKeyModeRootMidi(),
      index: -1,
      matchedMs: 0,
      startMs: 0,
      endMs: 0,
    };
  }
  return getReferenceNote(songTimeMs) || state.chart.find((note) => !note.judged) || state.chart[0] || null;
}

function getActiveWindowNote(songTimeMs = state.currentSongTimeMs) {
  if (state.practiceContext === "key") {
    return null;
  }
  return state.chart.find((note) => songTimeMs >= note.startMs && songTimeMs <= note.endMs) || getReferenceNote(songTimeMs);
}

function getReferenceProgress(songTimeMs = state.currentSongTimeMs) {
  if (state.practiceContext === "key") {
    return 0;
  }
  const referenceNote = getReferenceNote(songTimeMs);
  if (!referenceNote) {
    return 0;
  }

  const duration = Math.max(1, referenceNote.endMs - referenceNote.startMs);
  if (state.progressionMode === "step") {
    return clamp(referenceNote.matchedMs / duration, 0, 1);
  }
  return clamp((songTimeMs - referenceNote.startMs) / duration, 0, 1);
}

function getNoteFinalizeGraceMs() {
  return state.progressionMode === "step" ? 0 : 140;
}

function getBbHornFingering(concertMidi) {
  if (!Number.isFinite(concertMidi)) {
    return null;
  }

  const writtenMidi = Math.round(concertMidi + 2);
  const writtenName = midiToNoteName(writtenMidi);
  const valves = BB_HORN_FINGERINGS[writtenName] || null;

  return {
    writtenMidi,
    writtenName,
    valves,
    comboLabel: valves ? (valves.length ? valves.join("-") : "Open") : "Check fingering",
  };
}

function updateValveDisplay(valves) {
  const valveElements = [elements.targetValve1, elements.targetValve2, elements.targetValve3];

  valveElements.forEach((element, index) => {
    const valveNumber = index + 1;
    const isPressed = Array.isArray(valves) && valves.includes(valveNumber);
    element.classList.toggle("is-pressed", isPressed);
    element.classList.toggle("is-idle", Array.isArray(valves) && !isPressed);
    element.classList.toggle("is-unknown", !Array.isArray(valves));
  });
}

function pitchMatches(note) {
  return (
    Number.isFinite(state.pitch.midiFloat) &&
    state.pitch.clarity >= 0.18 &&
    Math.abs(state.pitch.midiFloat - note.targetMidi) <= state.toleranceCents / 100
  );
}

function setToggleSelected(button, isSelected) {
  button.classList.toggle("is-selected", isSelected);
  button.setAttribute("aria-pressed", isSelected ? "true" : "false");
}

function getStartActionLabel() {
  return state.progressionMode === "step" ? "Start Practice" : "Start Run";
}

function setupTransposeOptions() {
  const fragment = document.createDocumentFragment();

  for (let value = -12; value <= 12; value += 1) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = `${value > 0 ? "+" : ""}${value} semitones`;
    if (value === 0) {
      option.selected = true;
    }
    fragment.appendChild(option);
  }

  elements.transposeSelect.appendChild(fragment);
}

function setupKeyModeOptions() {
  const rootFragment = document.createDocumentFragment();
  for (let pitchClass = 0; pitchClass < NOTE_NAMES.length; pitchClass += 1) {
    const option = document.createElement("option");
    option.value = String(pitchClass);
    option.textContent = getPitchClassName(pitchClass);
    if (pitchClass === state.keyMode.rootPc) {
      option.selected = true;
    }
    rootFragment.appendChild(option);
  }
  elements.keyRootSelect.appendChild(rootFragment);

  const paletteFragment = document.createDocumentFragment();
  KEY_PALETTES.forEach((palette) => {
    const option = document.createElement("option");
    option.value = palette.id;
    option.textContent = palette.label;
    if (palette.id === state.keyMode.paletteId) {
      option.selected = true;
    }
    paletteFragment.appendChild(option);
  });
  elements.keyPaletteSelect.appendChild(paletteFragment);
}

function resetPitchState() {
  state.pitch = {
    frequency: null,
    midiFloat: null,
    midiRounded: null,
    cents: null,
    clarity: 0,
    amplitude: 0,
  };
}

function resetTunerDisplay(reason = state.micReady ? "Listening for a note" : "Microphone off") {
  elements.detectedNote.textContent = "--";
  elements.detectedFrequency.textContent = "-- Hz";
  elements.detectedCents.textContent = "-- cents";
  elements.detectedClarity.textContent = reason;
}

function resetScoreboard() {
  state.stepJustReset = false;
  state.score = {
    points: 0,
    streak: 0,
    judged: 0,
    hits: 0,
    misses: 0,
    holdSum: 0,
  };
  updateScoreboard();
}

function updateScoreboard() {
  if (state.practiceContext === "key") {
    const stats = state.keyMode.stats;
    const accuracy = stats.events ? Math.round((stats.hits / stats.events) * 100) : 0;
    elements.scoreValue.textContent = String(stats.hits);
    elements.streakValue.textContent = `Streak ${stats.streak}`;
    elements.accuracyValue.textContent = `${accuracy}%`;
    elements.notesValue.textContent = `${stats.misses} out`;
    return;
  }

  const accuracy = state.score.judged ? Math.round((state.score.holdSum / state.score.judged) * 100) : 0;
  elements.scoreValue.textContent = String(state.score.points);
  elements.streakValue.textContent = `Streak ${state.score.streak}`;
  elements.accuracyValue.textContent = `${accuracy}%`;
  elements.notesValue.textContent = `${state.score.hits} / ${state.score.judged} notes`;
}

function updateSongMeta() {
  if (state.practiceContext === "key") {
    const stats = state.keyMode.stats;
    elements.songMeta.textContent = `${getKeyModeLabel()} • ${stats.hits} in key • ${stats.misses} out`;
    elements.timeMeta.textContent = "LIVE KEY LOCK";
    return;
  }

  if (!state.chartReady) {
    elements.songMeta.textContent = "No chart loaded";
    elements.timeMeta.textContent = "00:00 / 00:00";
    return;
  }

  const parts = [state.selection?.title || state.chartName, `${state.chart.length} notes`, getChartDurationLabel()];
  if (state.audioFileName) {
    parts.push(`Backing ${state.audioFileName}`);
  }
  if (state.progressionMode === "step") {
    parts.push("Wait mode");
  }

  elements.songMeta.textContent = parts.join(" • ");
  elements.timeMeta.textContent = `${formatClockMs(state.currentSongTimeMs)} / ${getChartDurationLabel()}`;
}

function updateSelectedSongCard() {
  if (state.practiceContext === "key") {
    const palette = getKeyPalette();
    elements.selectedSongTitle.textContent = `${getPitchClassName(state.keyMode.rootPc)} ${palette.label}`;
    elements.selectedSongDetail.textContent = "Free play key lock. Only notes from the selected palette count.";
    elements.selectedSourceTag.textContent = "Key Lock";
    elements.selectedDifficultyTag.textContent = "Improvisation";
    elements.selectedRangeTag.textContent = getKeyModeAllowedNoteNames().join(" ");
    elements.selectedDurationTag.textContent = "Live";
    return;
  }

  if (!state.selection) {
    elements.selectedSongTitle.textContent = "No chart loaded";
    elements.selectedSongDetail.textContent = "Choose a built-in scale, tune, or upload a melody MIDI to load a chart.";
    elements.selectedSourceTag.textContent = "Select a source";
    elements.selectedDifficultyTag.textContent = "Difficulty";
    elements.selectedRangeTag.textContent = "Range";
    elements.selectedDurationTag.textContent = "Length";
    return;
  }

  elements.selectedSongTitle.textContent = state.selection.title;

  const detailParts = [];
  if (state.selection.subtitle) {
    detailParts.push(state.selection.subtitle);
  }
  if (state.activeTrackLabel && state.tracks.length > 1) {
    detailParts.push(state.activeTrackLabel);
  }
  elements.selectedSongDetail.textContent = detailParts.join(" • ") || "Chart ready";

  elements.selectedSourceTag.textContent = state.selection.kind === "library" ? "Built-in MIDI" : "Uploaded MIDI";
  elements.selectedDifficultyTag.textContent = state.selection.difficulty || "Custom";
  elements.selectedRangeTag.textContent = state.chartReady
    ? `Range ${getChartRangeLabel()}`
    : state.selection.noteRange
      ? `Range ${state.selection.noteRange}`
      : "Range";
  elements.selectedDurationTag.textContent = state.chartReady
    ? `Length ${getChartDurationLabel()}`
    : Number.isFinite(state.selection.durationSeconds)
      ? `Length ${formatClockMs(state.selection.durationSeconds * 1000)}`
      : "Length";
}

function updateWorkflowUI() {
  const keyModeActive = state.practiceContext === "key";
  const songReady = keyModeActive || state.chartReady;
  const micReady = state.micReady;
  const playReady = !keyModeActive && songReady && micReady;

  if (keyModeActive && !micReady) {
    elements.nextActionText.textContent = "Enable the microphone, then stay inside the selected key.";
  } else if (keyModeActive) {
    elements.nextActionText.textContent = "Play freely. Any out-of-key note will be flagged immediately.";
  } else if (!songReady) {
    elements.nextActionText.textContent = "Choose a built-in scale, tune, or upload a MIDI.";
  } else if (!micReady) {
    elements.nextActionText.textContent = "Enable the microphone so the horn can be tracked.";
  } else if (state.progressionMode === "step" && !state.running) {
    elements.nextActionText.textContent = "Start practice. The chart will wait until each note is correct.";
  } else if (!state.running) {
    elements.nextActionText.textContent = "Press Start Run for a two-beat count-in.";
  } else if (state.currentSongTimeMs < 0) {
    elements.nextActionText.textContent = `Count-in: ${Math.ceil(Math.abs(state.currentSongTimeMs) / 1000)}`;
  } else if (state.progressionMode === "step") {
    elements.nextActionText.textContent = "Hold the right pitch until the note is complete to unlock the next one.";
  } else {
    elements.nextActionText.textContent = "Enter the note as it reaches the line.";
  }

  elements.trackSelectWrap.classList.toggle("is-hidden", keyModeActive || state.tracks.length <= 1);
  elements.keyLockBlock.classList.toggle("is-hidden", !keyModeActive);
  elements.playControlsRow.classList.toggle("is-hidden", keyModeActive);
  elements.micButton.textContent = state.micReady ? "Microphone Ready" : "Enable Microphone";
  elements.startButton.disabled = !playReady || state.running;
  elements.startButton.textContent = getStartActionLabel();
  elements.stopButton.disabled = !state.running;
  elements.modeFlowBtn.disabled = keyModeActive;
  elements.modeStepBtn.disabled = keyModeActive;
  elements.transposeSelect.disabled = keyModeActive;
  elements.viewLaneBtn.disabled = keyModeActive;
  elements.viewStaffBtn.disabled = keyModeActive;
  elements.keyRootSelect.disabled = !keyModeActive;
  elements.keyPaletteSelect.disabled = !keyModeActive;
  elements.randomKeyBtn.disabled = !keyModeActive;
  elements.resetKeyModeBtn.disabled = !keyModeActive;
  elements.hearTargetBtn.textContent = keyModeActive ? "Hear root" : "Hear target";

  setToggleSelected(elements.viewLaneBtn, state.viewMode === "lane");
  setToggleSelected(elements.viewStaffBtn, state.viewMode === "staff");
  setToggleSelected(elements.modeFlowBtn, state.progressionMode === "flow");
  setToggleSelected(elements.modeStepBtn, state.progressionMode === "step");
  setToggleSelected(elements.sessionChartBtn, state.practiceContext === "chart");
  setToggleSelected(elements.sessionKeyBtn, keyModeActive);
}

function getLiveCoachMessage(referenceNote) {
  if (!referenceNote) {
    return "Finish the phrase and hold the last note cleanly.";
  }

  if (state.progressionMode === "step" && state.stepJustReset) {
    return "Hold broke. Restart the note from the beginning.";
  }

  if (!state.micReady) {
    return "Enable the microphone to see your blue note marker.";
  }

  if (!Number.isFinite(state.pitch.midiFloat)) {
    return "Play a note to place your marker.";
  }

  const centsOff = Math.round((state.pitch.midiFloat - referenceNote.targetMidi) * 100);
  if (Math.abs(centsOff) <= Math.round(state.toleranceCents * 0.65)) {
    return state.progressionMode === "step"
      ? "Centered. Hold it until the note fills and the next one unlocks."
      : "Centered. Hold it through the full bar.";
  }

  return centsOff < 0 ? `${Math.abs(centsOff)} cents flat. Bring the pitch up.` : `${centsOff} cents sharp. Relax it down.`;
}

function updateLiveHud() {
  const keyModeActive = state.practiceContext === "key";
  const referenceNote = getReferenceNote(state.currentSongTimeMs);
  const targetNote = getTargetPreviewNote(state.currentSongTimeMs);
  const fingering = targetNote ? getBbHornFingering(targetNote.targetMidi) : null;
  const playerLabel = Number.isFinite(state.pitch.midiRounded) ? midiToNoteName(state.pitch.midiRounded) : "--";
  const referenceProgress = getReferenceProgress(state.currentSongTimeMs);
  const heldMs = referenceNote ? Math.round(clamp(referenceNote.matchedMs, 0, referenceNote.endMs - referenceNote.startMs)) : 0;
  const durationMs = referenceNote ? Math.round(referenceNote.endMs - referenceNote.startMs) : 0;

  elements.liveTargetNote.textContent = targetNote ? midiToNoteName(targetNote.targetMidi) : "--";
  elements.liveTargetHz.textContent = targetNote ? formatFrequencyLabel(midiToFrequency(targetNote.targetMidi)) : "-- Hz";
  elements.targetPitchMeta.textContent = keyModeActive
    ? `${getKeyModeLabel()} key lock`
    : targetNote
      ? "Concert pitch target"
      : "Concert pitch";
  elements.targetFingeringLabel.textContent = fingering
    ? (keyModeActive
      ? `Root: Bb horn ${fingering.writtenName} • ${fingering.comboLabel}`
      : `Bb horn: ${fingering.writtenName} • ${fingering.comboLabel}`)
    : "Bb horn: --";
  elements.hearTargetBtn.disabled = !targetNote;
  updateValveDisplay(fingering?.valves ?? null);
  elements.livePlayerNote.textContent = playerLabel;
  elements.livePlayerHz.textContent = formatFrequencyLabel(state.pitch.frequency);

  if (keyModeActive) {
    elements.stageTitle.textContent = `${getKeyModeLabel()} Key Lock`;
    elements.overlayPrimary.textContent = getKeyModeCoachMessage();
    elements.overlaySecondary.textContent = `Only play ${getKeyModeAllowedNoteNames().join(" ")}.`;
  } else if (!state.chartReady) {
    elements.stageTitle.textContent = "Load a chart to begin";
    elements.overlayPrimary.textContent = "The bright line is the entry point.";
    elements.overlaySecondary.textContent = "Choose a built-in scale or tune, enable the mic, then begin.";
  } else if (!state.micReady) {
    elements.stageTitle.textContent = `${state.selection?.title || "Chart"} loaded`;
    elements.overlayPrimary.textContent = referenceNote
      ? `First target: ${midiToNoteName(referenceNote.targetMidi)}`
      : "Chart loaded";
    elements.overlaySecondary.textContent = "Click a note or press Hear target. Enable the microphone to track your horn.";
  } else if (!state.running) {
    elements.stageTitle.textContent = `${state.selection?.title || "Chart"} ready`;
    elements.overlayPrimary.textContent = state.progressionMode === "step"
      ? "Press Start Practice. The chart will wait for each note."
      : "Press Start Run for a two-beat count-in.";
    elements.overlaySecondary.textContent = "Click a note to hear it. Then match it cleanly.";
  } else if (state.currentSongTimeMs < 0) {
    elements.stageTitle.textContent = `Count-in ${Math.ceil(Math.abs(state.currentSongTimeMs) / 1000)}`;
    elements.overlayPrimary.textContent = referenceNote
      ? `First note: ${midiToNoteName(referenceNote.targetMidi)}`
      : "Count-in running";
    elements.overlaySecondary.textContent = "Take a breath. Enter when the first bar hits the line.";
  } else {
    elements.stageTitle.textContent = referenceNote
      ? `Play ${midiToNoteName(referenceNote.targetMidi)} at the line`
      : "Phrase complete";
    elements.overlayPrimary.textContent = getLiveCoachMessage(referenceNote);
    elements.overlaySecondary.textContent = state.progressionMode === "step" && referenceNote
      ? `Hold ${heldMs} / ${durationMs} ms to advance.`
      : referenceNote
        ? `Note progress ${Math.round(referenceProgress * 100)}%. Pitch window: +/-${state.toleranceCents} cents.`
        : `Pitch window: +/-${state.toleranceCents} cents.`;
  }

  updateSongMeta();
}

function buildChartRuntime(notes) {
  return notes.map((note, index) => ({
    ...note,
    index,
    targetMidi: note.midi + state.transpose,
    matchedMs: 0,
    sampledMs: 0,
    firstMatchMs: null,
    judged: false,
    grade: "pending",
  }));
}

function updateChartTargets() {
  state.chart = buildChartRuntime(state.chartBaseNotes);
  syncRenderRange();
}

function loadChart(notes) {
  const filtered = notes
    .filter((note) => Number.isFinite(note.startMs) && Number.isFinite(note.endMs) && Number.isFinite(note.midi))
    .filter((note) => note.endMs - note.startMs >= 80)
    .sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);

  const monophonic = [];
  for (const originalNote of filtered) {
    const note = { ...originalNote };
    const last = monophonic[monophonic.length - 1];

    if (!last) {
      monophonic.push(note);
      continue;
    }

    if (note.startMs < last.endMs) {
      const overlapGap = last.endMs - note.startMs;
      if (overlapGap > 40) {
        last.endMs = Math.max(last.startMs + 80, note.startMs - 10);
      }
      note.startMs = Math.max(note.startMs, last.endMs + 10);
    }

    if (note.endMs - note.startMs >= 80) {
      monophonic.push(note);
    }
  }

  state.chartBaseNotes = monophonic.map((note) => ({ ...note }));
  state.chartName = state.selection?.title || state.activeTrackLabel || "Chart";
  state.chartSource = state.selection?.source || "MIDI";
  state.chartDurationMs = monophonic.length ? monophonic[monophonic.length - 1].endMs + 1200 : 0;
  state.currentSongTimeMs = 0;
  state.chartReady = monophonic.length > 0;
  state.practiceContext = "chart";
  updateChartTargets();

  resetScoreboard();
  updateSelectedSongCard();
  updateWorkflowUI();
  updateLiveHud();

  setSessionStatus(
    state.micReady
      ? `${state.chartName} loaded. Press ${getStartActionLabel()} when you are ready.`
      : `${state.chartName} loaded. Enable the microphone to continue.`
  );

  drawScene(state.currentSongTimeMs);
}

function populateTrackSelect(tracks) {
  elements.trackSelect.innerHTML = "";

  tracks.forEach((track, index) => {
    const option = document.createElement("option");
    option.value = track.key;
    option.textContent = `${index + 1}. ${track.label}`;
    elements.trackSelect.appendChild(option);
  });

  elements.trackSelect.disabled = tracks.length === 0;
  if (tracks.length) {
    elements.trackSelect.value = tracks[0].key;
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No note tracks found";
    elements.trackSelect.appendChild(option);
  }
}

function selectTrack(key) {
  const track = state.tracks.find((entry) => entry.key === key);
  if (!track) {
    return;
  }

  state.selectedTrackKey = key;
  state.activeTrackLabel = track.label;
  elements.trackSelect.value = key;
  loadChart(track.notes);
}

function clearBackingAudio() {
  if (state.backingSource) {
    try {
      state.backingSource.stop();
    } catch (error) {
      // Ignore invalid state if the source already ended.
    }
    state.backingSource.disconnect();
    state.backingSource = null;
  }

  state.audioFileName = "";
  state.pendingAudioFile = null;
  state.backingBuffer = null;
  elements.audioInput.value = "";
}

function renderLibrary() {
  elements.libraryGrid.innerHTML = "";

  if (!state.library.length) {
    const empty = document.createElement("div");
    empty.className = "upload-card";
    empty.innerHTML = "<span>No built-in charts loaded</span><small>The starter library could not be loaded. Try the embedded scale set or serve on localhost.</small>";
    elements.libraryGrid.appendChild(empty);
    return;
  }

  state.library.forEach((song) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "library-card";
    card.dataset.color = song.color || "sunrise";
    if (song.id === state.selectedLibrarySongId) {
      card.classList.add("is-active");
    }

    card.innerHTML = `
      <div class="library-card-top">
        <div>
          <h3>${song.title}</h3>
          <p>${song.subtitle || ""}</p>
        </div>
        <span class="stat-pill">${song.difficulty || "Practice"}</span>
      </div>
      <p>${song.description || ""}</p>
      <div class="song-stats">
        <span class="stat-pill">${song.bpm} BPM</span>
        <span class="stat-pill">${song.noteRange}</span>
        <span class="stat-pill">${formatClockMs(song.durationSeconds * 1000)}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      void loadBuiltInSong(song.id);
    });

    elements.libraryGrid.appendChild(card);
  });
}

function readVariableLength(view, offset) {
  let value = 0;
  let length = 0;

  while (offset + length < view.byteLength) {
    const byte = view.getUint8(offset + length);
    value = (value << 7) | (byte & 0x7f);
    length += 1;

    if ((byte & 0x80) === 0) {
      return { value, length };
    }
  }

  throw new Error("Invalid MIDI variable-length value.");
}

function decodeAscii(bytes) {
  return new TextDecoder("utf-8").decode(bytes).replace(/\0/g, "").trim();
}

function parseMidi(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  let offset = 0;

  const readChunk = () => {
    const id = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const length = view.getUint32(offset + 4);
    const start = offset + 8;
    const end = start + length;
    offset = end;
    return { id, start, end };
  };

  const header = readChunk();
  if (header.id !== "MThd") {
    throw new Error("Invalid MIDI file header.");
  }

  const trackCount = view.getUint16(header.start + 2);
  const division = view.getUint16(header.start + 4);
  if (division & 0x8000) {
    throw new Error("SMPTE-timed MIDI files are not supported.");
  }

  const ppq = division;
  const tempoEvents = [{ tick: 0, microsecondsPerQuarter: 500000 }];
  const tracks = [];

  for (let trackIndex = 0; trackIndex < trackCount; trackIndex += 1) {
    const chunk = readChunk();
    if (chunk.id !== "MTrk") {
      throw new Error(`Unexpected MIDI chunk ${chunk.id}.`);
    }

    let trackOffset = chunk.start;
    let runningStatus = null;
    let absoluteTick = 0;
    let trackName = "";
    let instrumentName = "";
    const notes = [];
    const activeNotes = new Map();

    while (trackOffset < chunk.end) {
      const delta = readVariableLength(view, trackOffset);
      absoluteTick += delta.value;
      trackOffset += delta.length;

      let statusByte = view.getUint8(trackOffset);
      if (statusByte < 0x80) {
        if (runningStatus === null) {
          throw new Error("Malformed running status in MIDI track.");
        }
        statusByte = runningStatus;
      } else {
        trackOffset += 1;
        runningStatus = statusByte < 0xf0 ? statusByte : null;
      }

      if (statusByte === 0xff) {
        const metaType = view.getUint8(trackOffset);
        trackOffset += 1;

        const metaLengthInfo = readVariableLength(view, trackOffset);
        trackOffset += metaLengthInfo.length;

        const metaStart = trackOffset;
        const metaEnd = metaStart + metaLengthInfo.value;
        const bytes = new Uint8Array(arrayBuffer, metaStart, metaLengthInfo.value);

        if (metaType === 0x03) {
          trackName = decodeAscii(bytes);
        } else if (metaType === 0x04) {
          instrumentName = decodeAscii(bytes);
        } else if (metaType === 0x51 && metaLengthInfo.value === 3) {
          const microsecondsPerQuarter = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
          tempoEvents.push({ tick: absoluteTick, microsecondsPerQuarter });
        }

        trackOffset = metaEnd;
        runningStatus = null;
        continue;
      }

      if (statusByte === 0xf0 || statusByte === 0xf7) {
        const sysexLengthInfo = readVariableLength(view, trackOffset);
        trackOffset += sysexLengthInfo.length + sysexLengthInfo.value;
        runningStatus = null;
        continue;
      }

      const command = statusByte >> 4;
      const channel = statusByte & 0x0f;
      const data1 = view.getUint8(trackOffset);
      trackOffset += 1;
      let data2 = null;

      if (![0xc, 0xd].includes(command)) {
        data2 = view.getUint8(trackOffset);
        trackOffset += 1;
      }

      if (command === 0x9 && data2 > 0) {
        const key = `${channel}:${data1}`;
        const stack = activeNotes.get(key) || [];
        stack.push({ startTick: absoluteTick, velocity: data2 });
        activeNotes.set(key, stack);
      } else if (command === 0x8 || (command === 0x9 && data2 === 0)) {
        const key = `${channel}:${data1}`;
        const stack = activeNotes.get(key);
        if (stack && stack.length) {
          const started = stack.pop();
          notes.push({
            midi: data1,
            startTick: started.startTick,
            endTick: absoluteTick,
            velocity: started.velocity,
            channel,
            trackIndex,
          });
          if (stack.length) {
            activeNotes.set(key, stack);
          } else {
            activeNotes.delete(key);
          }
        }
      }
    }

    tracks.push({ trackIndex, trackName, instrumentName, notes });
  }

  tempoEvents.sort((a, b) => a.tick - b.tick);
  const compactTempoEvents = [];

  for (const event of tempoEvents) {
    const last = compactTempoEvents[compactTempoEvents.length - 1];
    if (!last || last.tick !== event.tick) {
      compactTempoEvents.push(event);
    } else {
      last.microsecondsPerQuarter = event.microsecondsPerQuarter;
    }
  }

  let cumulativeMs = 0;
  for (let index = 0; index < compactTempoEvents.length; index += 1) {
    const event = compactTempoEvents[index];
    const next = compactTempoEvents[index + 1];
    event.msAtTick = cumulativeMs;

    if (next) {
      const deltaTicks = next.tick - event.tick;
      cumulativeMs += (deltaTicks * event.microsecondsPerQuarter) / (ppq * 1000);
    }
  }

  const tickToMs = (tick) => {
    let segment = compactTempoEvents[0];

    for (let index = 1; index < compactTempoEvents.length; index += 1) {
      if (compactTempoEvents[index].tick > tick) {
        break;
      }
      segment = compactTempoEvents[index];
    }

    return segment.msAtTick + ((tick - segment.tick) * segment.microsecondsPerQuarter) / (ppq * 1000);
  };

  return {
    tracks: tracks
      .map((track) => {
        const convertedNotes = track.notes
          .map((note) => ({
            startMs: tickToMs(note.startTick),
            endMs: tickToMs(note.endTick),
            midi: note.midi,
            velocity: note.velocity,
            channel: note.channel,
          }))
          .filter((note) => note.endMs > note.startMs + 20);

        const labelParts = [
          track.trackName || `Track ${track.trackIndex + 1}`,
          track.instrumentName || null,
          `${convertedNotes.length} notes`,
        ].filter(Boolean);

        return {
          key: `track-${track.trackIndex}`,
          label: labelParts.join(" • "),
          notes: convertedNotes,
        };
      })
      .filter((track) => track.notes.length),
  };
}

function applyParsedMidi(parsedMidi, selection) {
  if (!parsedMidi.tracks.length) {
    throw new Error("This MIDI did not contain any playable note tracks.");
  }

  stopSession();
  clearBackingAudio();

  state.selection = selection;
  state.selectedLibrarySongId = selection.kind === "library" ? selection.id : null;
  state.tracks = parsedMidi.tracks;
  populateTrackSelect(parsedMidi.tracks);
  renderLibrary();
  selectTrack(parsedMidi.tracks[0].key);
}

function getBundledLibrary() {
  return EMBEDDED_LIBRARY.map((song) => ({
    ...song,
    embeddedTracks: cloneTracks(song.embeddedTracks),
  }));
}

function attachEmbeddedFallbacks(manifest) {
  return manifest.map((song) => {
    const embeddedSong = EMBEDDED_LIBRARY_BY_ID.get(song.id);
    if (!embeddedSong) {
      return song;
    }

    return {
      ...song,
      embeddedTracks: cloneTracks(embeddedSong.embeddedTracks),
    };
  });
}

async function loadBuiltInSong(songId) {
  const song = state.library.find((entry) => entry.id === songId);
  if (!song) {
    setLibraryStatus("That built-in chart is not available.");
    return;
  }

  setLibraryStatus(`Loading ${song.title}...`);

  if (window.location.protocol === "file:" && song.embeddedTracks) {
    applyParsedMidi(
      { tracks: cloneTracks(song.embeddedTracks) },
      {
        kind: "library",
        ...song,
        source: "Embedded Starter Library",
      }
    );
    setLibraryStatus(`${state.library.length} built-in starter charts ready for direct-open use.`);
    setSessionStatus(
      state.micReady
        ? `${song.title} loaded from the embedded starter library. Press ${getStartActionLabel()} when you are ready.`
        : `${song.title} loaded from the embedded starter library. Enable the microphone to continue.`
    );
    return;
  }

  try {
    const response = await fetch(song.midiPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const parsedMidi = parseMidi(arrayBuffer);

    applyParsedMidi(parsedMidi, {
      kind: "library",
      ...song,
    });

    setLibraryStatus(`${state.library.length} charts ready.`);
    setSessionStatus(
      state.micReady
        ? `${song.title} loaded. Press ${getStartActionLabel()} when you are ready.`
        : `${song.title} loaded. Enable the microphone to continue.`
    );
  } catch (error) {
    if (song.embeddedTracks) {
      applyParsedMidi(
        { tracks: cloneTracks(song.embeddedTracks) },
        {
          kind: "library",
          ...song,
          source: "Embedded Starter Library",
        }
      );
      setLibraryStatus(`${song.title} loaded from the embedded starter library.`);
      setSessionStatus(
        state.micReady
          ? `${song.title} loaded from the embedded starter library. Press ${getStartActionLabel()} when you are ready.`
          : `${song.title} loaded from the embedded starter library. Enable the microphone to continue.`
      );
      return;
    }

    setLibraryStatus(`Could not load ${song.title}: ${error.message}`);
  }
}

async function initializeLibrary() {
  if (window.location.protocol === "file:") {
    state.library = getBundledLibrary();
    renderLibrary();
    setLibraryStatus(`${state.library.length} starter charts ready for double-click use.`);
    if (state.library.length) {
      await loadBuiltInSong(state.library[0].id);
    }
    return;
  }

  try {
    setLibraryStatus("Loading charts...");
    const response = await fetch(LIBRARY_MANIFEST_PATH);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    state.library = attachEmbeddedFallbacks(await response.json());
    renderLibrary();
    setLibraryStatus(`${state.library.length} charts ready.`);

    if (state.library.length) {
      await loadBuiltInSong(state.library[0].id);
    }
  } catch (error) {
    state.library = getBundledLibrary();
    renderLibrary();
    setLibraryStatus(`${state.library.length} embedded starter charts loaded because the fetched library was unavailable.`);
    if (state.library.length) {
      await loadBuiltInSong(state.library[0].id);
    } else {
      setSessionStatus("The built-in chart library could not load.");
    }
  }
}

async function handleMidiFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const parsedMidi = parseMidi(arrayBuffer);

    applyParsedMidi(parsedMidi, {
      kind: "upload",
      title: prettifyFileName(file.name),
      subtitle: "Uploaded melody MIDI",
      description: "Uploaded MIDI loaded. If the wrong notes appear, try a different melody track below.",
      difficulty: "Custom",
      source: file.name,
      noteRange: null,
      durationSeconds: null,
    });

    setSessionStatus(
      state.micReady
        ? `${file.name} loaded. Press ${getStartActionLabel()} when you are ready.`
        : `${file.name} loaded. Enable the microphone to continue.`
    );
  } catch (error) {
    setSessionStatus(`Could not parse MIDI: ${error.message}`);
  }
}

async function decodeBackingAudioFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await state.audioContext.decodeAudioData(arrayBuffer.slice(0));
    state.backingBuffer = decoded;
    setSessionStatus(`${state.chartName} is ready with backing audio.`);
    updateSongMeta();
  } catch (error) {
    state.backingBuffer = null;
    setSessionStatus(`Could not decode backing audio: ${error.message}`);
  }
}

async function handleAudioFile(file) {
  if (!state.chartReady) {
    setSessionStatus("Load a chart before adding backing audio.");
    elements.audioInput.value = "";
    return;
  }

  stopSession();
  state.audioFileName = file.name;
  state.pendingAudioFile = file;
  state.backingBuffer = null;
  updateSongMeta();

  if (!state.audioContext) {
    setSessionStatus("Backing audio selected. Enable the microphone to decode and use it.");
    return;
  }

  await decodeBackingAudioFile(file);
}

async function enableMicrophone() {
  if (state.micReady) {
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const audioContext = await getSharedAudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0;

    const source = audioContext.createMediaStreamSource(stream);
    const highpass = audioContext.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = PITCH_DETECTION.analysisHighpassHz;
    highpass.Q.value = 0.7;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = PITCH_DETECTION.analysisLowpassHz;
    lowpass.Q.value = 0.8;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(analyser);

    state.analyser = analyser;
    state.micSource = source;
    state.micHighpassFilter = highpass;
    state.micLowpassFilter = lowpass;
    state.micStream = stream;
    state.timeDomainBuffer = new Float32Array(analyser.fftSize);
    state.micReady = true;

    if (state.pendingAudioFile) {
      await decodeBackingAudioFile(state.pendingAudioFile);
    }

    resetTunerDisplay("Listening for a note");
    updateWorkflowUI();
    updateLiveHud();

    setSessionStatus(
      state.chartReady
        ? `Microphone ready. Press ${getStartActionLabel()} when you want the count-in.`
        : "Microphone ready. Choose a chart from the library."
    );
  } catch (error) {
    setSessionStatus(`Mic access failed: ${error.message}`);
  }
}

function detectPitch() {
  if (!state.analyser || !state.timeDomainBuffer) {
    return null;
  }

  state.analyser.getFloatTimeDomainData(state.timeDomainBuffer);
  const sampleRate = state.audioContext.sampleRate;
  const { analysisBuffer, rms } = preparePitchAnalysisBuffer(state.timeDomainBuffer);
  if (rms < PITCH_DETECTION.rmsFloor) {
    return null;
  }

  const detected = detectPitchYin(analysisBuffer, sampleRate);
  if (!detected) {
    return null;
  }

  const correctedFrequency = resolveBrassHarmonicAlias(detected.frequency, detected.periodicity);
  const correctedMidi = frequencyToMidi(correctedFrequency);
  const previousMidi = state.pitch.midiFloat;
  const clarity = clamp((detected.periodicity - PITCH_DETECTION.periodicityFloor) / (1 - PITCH_DETECTION.periodicityFloor), 0, 1);

  if (
    Number.isFinite(previousMidi) &&
    Math.abs(correctedMidi - previousMidi) > PITCH_DETECTION.unstableJumpSemitones &&
    clarity < PITCH_DETECTION.unstableJumpClarity
  ) {
    return null;
  }

  return {
    frequency: correctedFrequency,
    clarity,
    amplitude: rms,
  };
}

function updatePitchState() {
  const detected = detectPitch();

  if (!detected) {
    resetPitchState();
    resetTunerDisplay(state.micReady ? "Listening for a note" : "Microphone off");
    return;
  }

  const midiFloat = frequencyToMidi(detected.frequency);
  const midiRounded = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midiRounded) * 100);

  if (Number.isFinite(state.pitch.midiFloat)) {
    const smoothedMidi = state.pitch.midiFloat * 0.65 + midiFloat * 0.35;
    const smoothedRounded = Math.round(smoothedMidi);
    state.pitch = {
      frequency: midiToFrequency(smoothedMidi),
      midiFloat: smoothedMidi,
      midiRounded: smoothedRounded,
      cents: Math.round((smoothedMidi - smoothedRounded) * 100),
      clarity: detected.clarity,
      amplitude: detected.amplitude,
    };
  } else {
    state.pitch = {
      frequency: detected.frequency,
      midiFloat,
      midiRounded,
      cents,
      clarity: detected.clarity,
      amplitude: detected.amplitude,
    };
  }

  elements.detectedNote.textContent = midiToNoteName(state.pitch.midiRounded);
  elements.detectedFrequency.textContent = `${state.pitch.frequency.toFixed(1)} Hz`;
  elements.detectedCents.textContent = `${state.pitch.cents > 0 ? "+" : ""}${state.pitch.cents} cents`;
  elements.detectedClarity.textContent = `${Math.round(state.pitch.clarity * 100)}% stable`;
}

async function playTargetPreview() {
  const targetNote = getTargetPreviewNote(state.currentSongTimeMs);
  if (!targetNote) {
    setSessionStatus("Load a chart to hear a target note.");
    return;
  }

  await playChartNotePreview(targetNote, "target");
}

async function playChartNotePreview(note, sourceLabel = "note") {
  if (!note || !Number.isFinite(note.targetMidi)) {
    setSessionStatus("That chart note could not be previewed.");
    return;
  }

  try {
    const audioContext = await getSharedAudioContext();
    const startTime = audioContext.currentTime + 0.01;
    const durationSeconds = 0.8;
    const stopTime = startTime + durationSeconds;
    const masterGain = audioContext.createGain();

    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.04);
    masterGain.gain.exponentialRampToValueAtTime(0.1, startTime + 0.16);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
    masterGain.connect(audioContext.destination);

    const fundamental = audioContext.createOscillator();
    fundamental.type = "triangle";
    fundamental.frequency.setValueAtTime(midiToFrequency(note.targetMidi), startTime);
    fundamental.connect(masterGain);

    const overtoneGain = audioContext.createGain();
    overtoneGain.gain.value = 0.06;
    overtoneGain.connect(masterGain);

    const overtone = audioContext.createOscillator();
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(midiToFrequency(note.targetMidi) * 2, startTime);
    overtone.connect(overtoneGain);

    fundamental.start(startTime);
    overtone.start(startTime);
    fundamental.stop(stopTime);
    overtone.stop(stopTime);
    fundamental.addEventListener("ended", () => {
      masterGain.disconnect();
      overtoneGain.disconnect();
    }, { once: true });

    setSessionStatus(`Previewing ${midiToNoteName(note.targetMidi)} (${sourceLabel}).`);
  } catch (error) {
    setSessionStatus(`Could not preview the note: ${error.message}`);
  }
}

async function startSession() {
  if (state.practiceContext !== "chart" || !state.chartReady || !state.micReady || state.running) {
    return;
  }

  if (state.pendingAudioFile && !state.backingBuffer) {
    await decodeBackingAudioFile(state.pendingAudioFile);
  }

  resetScoreboard();
  state.chart = buildChartRuntime(state.chartBaseNotes);
  state.running = true;
  state.currentSongTimeMs = -state.countInMs;
  state.songStartPerfMs = performance.now() + state.countInMs;
  state.lastFrameMs = performance.now();
  state.stepJustReset = false;
  await state.audioContext.resume();

  if (state.backingBuffer && state.progressionMode === "flow") {
    try {
      const source = state.audioContext.createBufferSource();
      source.buffer = state.backingBuffer;
      source.connect(state.audioContext.destination);
      source.start(state.audioContext.currentTime + state.countInMs / 1000);
      state.backingSource = source;
    } catch (error) {
      setSessionStatus(`Backing audio could not start: ${error.message}`);
    }
  } else if (state.backingBuffer && state.progressionMode === "step") {
    setSessionStatus("Practice mode ignores backing audio because note timing pauses until you get it right.");
  }

  updateWorkflowUI();
  updateLiveHud();
  setSessionStatus(
    state.progressionMode === "step"
      ? "Count-in running. The chart will wait on each note until it is correct."
      : "Count-in running. Enter on the first note."
  );
}

function finalizeNote(note) {
  if (note.judged) {
    return;
  }

  note.judged = true;
  const duration = Math.max(1, note.endMs - note.startMs);
  const holdRatio = clamp(note.matchedMs / duration, 0, 1);
  const onsetError = note.firstMatchMs === null ? Number.POSITIVE_INFINITY : Math.abs(note.firstMatchMs - note.startMs);

  state.score.judged += 1;
  state.score.holdSum += holdRatio;

  if (holdRatio >= 0.75 && onsetError <= 180) {
    note.grade = "perfect";
    state.score.points += 120 + state.score.streak * 3;
    state.score.streak += 1;
    state.score.hits += 1;
  } else if (holdRatio >= 0.45) {
    note.grade = "good";
    state.score.points += 75 + state.score.streak * 2;
    state.score.streak += 1;
    state.score.hits += 1;
  } else {
    note.grade = "miss";
    state.score.misses += 1;
    state.score.streak = 0;
  }

  updateScoreboard();
}

function updateScoring(songTimeMs, frameDeltaMs) {
  const finalizeGraceMs = getNoteFinalizeGraceMs();

  for (const note of state.chart) {
    if (note.judged) {
      continue;
    }

    if (songTimeMs >= note.startMs && songTimeMs <= note.endMs) {
      note.sampledMs += frameDeltaMs;

      if (pitchMatches(note)) {
        note.matchedMs += frameDeltaMs;
        if (note.firstMatchMs === null) {
          note.firstMatchMs = songTimeMs;
        }
      }
    }

    if (songTimeMs > note.endMs + finalizeGraceMs) {
      finalizeNote(note);
    }
  }
}

function updateScoringStep(frameDeltaMs) {
  const referenceNote = getReferenceNote(state.currentSongTimeMs);
  if (!referenceNote) {
    state.currentSongTimeMs = state.chartDurationMs;
    return;
  }

  if (state.currentSongTimeMs < referenceNote.startMs) {
    state.currentSongTimeMs = referenceNote.startMs;
  }

  if (!pitchMatches(referenceNote)) {
    if (referenceNote.matchedMs > 0) {
      referenceNote.matchedMs = 0;
      referenceNote.sampledMs = 0;
      referenceNote.firstMatchMs = null;
      state.currentSongTimeMs = referenceNote.startMs;
      state.stepJustReset = true;
    }
    return;
  }

  state.stepJustReset = false;

  const remainingMs = Math.max(0, referenceNote.endMs - state.currentSongTimeMs);
  const advanceMs = Math.min(frameDeltaMs, remainingMs);
  referenceNote.sampledMs += advanceMs;
  referenceNote.matchedMs += advanceMs;

  if (referenceNote.firstMatchMs === null) {
    referenceNote.firstMatchMs = referenceNote.startMs;
  }

  state.currentSongTimeMs += advanceMs;

  if (state.currentSongTimeMs >= referenceNote.endMs) {
    finalizeNote(referenceNote);
    const nextNote = state.chart.find((note) => !note.judged);
    state.currentSongTimeMs = nextNote ? nextNote.startMs : state.chartDurationMs;
  }
}

function stopSession() {
  const activePracticeNote = state.progressionMode === "step" && state.currentSongTimeMs >= 0
    ? getReferenceNote(state.currentSongTimeMs)
    : null;

  if (state.backingSource) {
    try {
      state.backingSource.stop();
    } catch (error) {
      // Ignore invalid state if the source already ended.
    }
    state.backingSource.disconnect();
    state.backingSource = null;
  }

  if (!state.running) {
    updateWorkflowUI();
    updateLiveHud();
    return;
  }

  state.running = false;
  state.stepJustReset = false;

  for (const note of state.chart) {
    if (!note.judged && state.currentSongTimeMs > note.endMs) {
      finalizeNote(note);
    }
  }

  if (activePracticeNote && !activePracticeNote.judged) {
    finalizeNote(activePracticeNote);
  }

  updateWorkflowUI();
  updateLiveHud();
  setSessionStatus("Run stopped. Adjust the chart or start again.");
  drawScene(state.currentSongTimeMs);
}

function resetCanvasHitRegions() {
  state.noteHitRegions = [];
}

function registerCanvasNoteHitRegion(note, left, top, width, height) {
  if (!note) {
    return;
  }

  state.noteHitRegions.push({
    note,
    left,
    top,
    right: left + width,
    bottom: top + height,
  });
}

function getCanvasPoint(event) {
  const rect = elements.canvas.getBoundingClientRect();
  const scaleX = elements.canvas.width / rect.width;
  const scaleY = elements.canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function getCanvasNoteAtPoint(point) {
  for (let index = state.noteHitRegions.length - 1; index >= 0; index -= 1) {
    const region = state.noteHitRegions[index];
    if (point.x >= region.left && point.x <= region.right && point.y >= region.top && point.y <= region.bottom) {
      return region.note;
    }
  }

  return null;
}

function updateCanvasHoverState(event) {
  if (!(state.chartReady || state.practiceContext === "key")) {
    state.hoveredCanvasNoteIndex = null;
    elements.canvas.style.cursor = "default";
    return;
  }

  const note = getCanvasNoteAtPoint(getCanvasPoint(event));
  state.hoveredCanvasNoteIndex = note ? note.index : null;
  elements.canvas.style.cursor = note ? "pointer" : "default";
}

function clearCanvasHoverState() {
  state.hoveredCanvasNoteIndex = null;
  elements.canvas.style.cursor = "default";
}

function drawPitchCompareRail(ctx, width, height, songTimeMs) {
  const keyModeActive = state.practiceContext === "key";
  const targetNote = getTargetPreviewNote(songTimeMs);
  const panelX = 24;
  const panelY = 24;
  const panelWidth = clamp(width * 0.22, 180, 236);
  const panelHeight = keyModeActive ? 148 : 126;

  ctx.fillStyle = "rgba(5, 9, 15, 0.9)";
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

  ctx.strokeStyle = "rgba(248, 250, 252, 0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  ctx.fillStyle = STUDIO_COLORS.muted;
  ctx.textAlign = "left";
  ctx.font = '17px "SFMono-Regular", "Menlo", "Consolas", monospace';
  ctx.fillText("PITCH COMPARE", panelX + 14, panelY + 22);

  const rows = [
    {
      label: keyModeActive ? "Key" : "Target",
      note: keyModeActive ? getKeyModeLabel({ short: true }) : (targetNote ? midiToNoteName(targetNote.targetMidi) : "--"),
      hz: keyModeActive
        ? `Root ${formatFrequencyLabel(targetNote ? midiToFrequency(targetNote.targetMidi) : null)}`
        : (targetNote ? formatFrequencyLabel(midiToFrequency(targetNote.targetMidi)) : "-- Hz"),
      accent: STUDIO_COLORS.gold,
    },
    {
      label: "You",
      note: Number.isFinite(state.pitch.midiRounded) ? midiToNoteName(state.pitch.midiRounded) : "--",
      hz: formatFrequencyLabel(state.pitch.frequency),
      accent: STUDIO_COLORS.sky,
    },
  ];

  rows.forEach((row, index) => {
    const rowY = panelY + 38 + index * 40;
    ctx.fillStyle = row.accent;
    ctx.fillRect(panelX + 14, rowY - 12, 4, 30);

    ctx.fillStyle = row.accent;
    ctx.font = '15px "SFMono-Regular", "Menlo", "Consolas", monospace';
    ctx.fillText(row.label, panelX + 28, rowY);

    ctx.fillStyle = STUDIO_COLORS.text;
    ctx.font = '24px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif';
    ctx.fillText(row.note, panelX + 88, rowY + 2);

    ctx.fillStyle = STUDIO_COLORS.muted;
    ctx.font = '14px "SFMono-Regular", "Menlo", "Consolas", monospace';
    ctx.fillText(row.hz, panelX + 88, rowY + 18);
  });

  ctx.fillStyle = "rgba(248, 250, 252, 0.72)";
  ctx.font = '15px "SFMono-Regular", "Menlo", "Consolas", monospace';
  ctx.fillText(
    keyModeActive ? `Only ${getKeyModeAllowedNoteNames().join(" ")}` : "Click any note to hear it",
    panelX + 14,
    panelY + panelHeight - 14
  );
}

function drawKeyLockScene(ctx, width, height) {
  const padding = Math.max(82, width * 0.07);
  const hitLineY = height - 122;
  const allowedPitchClasses = new Set(getKeyModeAllowedPitchClasses());
  const rootPitchClass = mod12(state.keyMode.rootPc);

  ctx.strokeStyle = STUDIO_COLORS.gold;
  ctx.lineWidth = 3;
  ctx.shadowColor = STUDIO_COLORS.goldGlow;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(padding, hitLineY);
  ctx.lineTo(width - padding, hitLineY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = STUDIO_COLORS.gold;
  ctx.textAlign = "left";
  ctx.font = '18px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText("STAY IN KEY", padding, hitLineY - 14);

  for (let midi = state.renderMinMidi; midi <= state.renderMaxMidi; midi += 1) {
    if (!allowedPitchClasses.has(mod12(midi))) {
      continue;
    }

    const x = noteToX(midi, width, padding);
    const columnWidth = mod12(midi) === rootPitchClass ? 32 : 24;
    const columnLeft = x - columnWidth / 2;

    ctx.fillStyle = mod12(midi) === rootPitchClass ? "rgba(255, 204, 102, 0.32)" : "rgba(125, 242, 223, 0.16)";
    ctx.fillRect(columnLeft, 42, columnWidth, hitLineY - 72);

    ctx.strokeStyle = mod12(midi) === rootPitchClass ? STUDIO_COLORS.gold : "rgba(125, 242, 223, 0.6)";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(columnLeft, 42, columnWidth, hitLineY - 72);

    if (state.hoveredCanvasNoteIndex === midi) {
      ctx.strokeStyle = STUDIO_COLORS.sky;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(columnLeft - 3, 39, columnWidth + 6, hitLineY - 66);
    }

    ctx.fillStyle = STUDIO_COLORS.text;
    ctx.textAlign = "center";
    ctx.font = '16px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
    ctx.fillText(midiToNoteName(midi), x, hitLineY - 82);

    registerCanvasNoteHitRegion({ targetMidi: midi, index: midi }, columnLeft, 42, columnWidth, hitLineY - 72);
  }

  if (Number.isFinite(state.pitch.midiFloat)) {
    const hornX = noteToX(state.pitch.midiFloat, width, padding);
    const inKey = isKeyModePitchAllowed(state.pitch.midiRounded);
    const hornColor = inKey ? STUDIO_COLORS.sky : STUDIO_COLORS.rose;
    const hornGlow = inKey ? STUDIO_COLORS.skyGlow : STUDIO_COLORS.roseGlow;

    ctx.fillStyle = hornColor;
    ctx.shadowBlur = 14;
    ctx.shadowColor = hornGlow;
    ctx.beginPath();
    ctx.arc(hornX, hitLineY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = inKey ? "rgba(223, 244, 255, 0.9)" : "rgba(255, 211, 213, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hornX, hitLineY, 21, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textAlign = "right";
  ctx.fillStyle = STUDIO_COLORS.muted;
  ctx.font = '22px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText(`${getKeyModeLabel()} • ${getKeyModeAllowedNoteNames().join(" ")}`, width - 28, height - 34);
}

function noteToX(midi, width, padding) {
  const span = Math.max(1, state.renderMaxMidi - state.renderMinMidi);
  const normalized = (midi - state.renderMinMidi) / span;
  return padding + normalized * (width - padding * 2);
}

function drawBackground(ctx, width, height, { showPitchGrid = state.viewMode === "lane" } = {}) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, STUDIO_COLORS.canvasBgRaised);
  gradient.addColorStop(0.58, "#060c14");
  gradient.addColorStop(1, STUDIO_COLORS.canvasBg);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(5, 9, 15, 0.94)";
  ctx.fillRect(0, height - 164, width, 164);

  ctx.strokeStyle = "rgba(248, 250, 252, 0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height - 164);
  ctx.lineTo(width, height - 164);
  ctx.stroke();

  for (let row = 1; row <= 5; row += 1) {
    const y = (height / 6) * row;
    ctx.strokeStyle = row === 5 ? "rgba(248, 250, 252, 0.06)" : "rgba(248, 250, 252, 0.03)";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (!showPitchGrid) {
    return;
  }

  const padding = Math.max(82, width * 0.07);
  for (let midi = state.renderMinMidi; midi <= state.renderMaxMidi; midi += 1) {
    const x = noteToX(midi, width, padding);
    ctx.strokeStyle = midi % 12 === 0 ? STUDIO_COLORS.gridStrong : STUDIO_COLORS.gridWeak;
    ctx.lineWidth = midi % 12 === 0 ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
  ctx.font = '16px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.textAlign = "center";

  for (let midi = state.renderMinMidi; midi <= state.renderMaxMidi; midi += 1) {
    const x = noteToX(midi, width, padding);
    ctx.fillText(midiToNoteName(midi), x, 30);
  }
}

function drawEmptyStage(ctx, width, height) {
  ctx.fillStyle = STUDIO_COLORS.text;
  ctx.textAlign = "center";
  ctx.font = '48px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText("Load A Chart", width / 2, height / 2 - 16);

  ctx.fillStyle = STUDIO_COLORS.gold;
  ctx.fillRect(width / 2 - 72, height / 2 + 4, 144, 3);

  ctx.fillStyle = STUDIO_COLORS.muted;
  ctx.font = '24px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText("Built-in MIDIs load from the library on the left.", width / 2, height / 2 + 44);
}

function drawCountInOverlay(ctx, width, height, songTimeMs) {
  if (!(state.running && songTimeMs < 0)) {
    return;
  }

  ctx.fillStyle = "rgba(3, 7, 12, 0.72)";
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.fillStyle = STUDIO_COLORS.gold;
  ctx.shadowBlur = 24;
  ctx.shadowColor = STUDIO_COLORS.goldGlow;
  ctx.arc(width / 2, height / 2, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = STUDIO_COLORS.surfaceInk;
  ctx.textAlign = "center";
  ctx.font = '92px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText(String(Math.ceil(Math.abs(songTimeMs) / 1000)), width / 2, height / 2 + 28);
}

function getStaffSlotForMidi(midi) {
  const { letter, octave } = splitNoteName(midi);
  return octave * 7 + STAFF_LETTER_STEPS[letter] - TREBLE_BOTTOM_LINE_STEP;
}

function getStaffYForMidi(midi, bottomLineY, stepSpacing) {
  return bottomLineY - getStaffSlotForMidi(midi) * stepSpacing;
}

function drawLedgerLines(ctx, x, slot, bottomLineY, stepSpacing) {
  ctx.strokeStyle = STUDIO_COLORS.gridStaff;
  ctx.lineWidth = 2;

  if (slot < 0) {
    for (let ledgerSlot = -2; ledgerSlot >= slot; ledgerSlot -= 2) {
      const y = bottomLineY - ledgerSlot * stepSpacing;
      ctx.beginPath();
      ctx.moveTo(x - 22, y);
      ctx.lineTo(x + 22, y);
      ctx.stroke();
    }
  } else if (slot > 8) {
    for (let ledgerSlot = 10; ledgerSlot <= slot; ledgerSlot += 2) {
      const y = bottomLineY - ledgerSlot * stepSpacing;
      ctx.beginPath();
      ctx.moveTo(x - 22, y);
      ctx.lineTo(x + 22, y);
      ctx.stroke();
    }
  }
}

function drawNoteHead(ctx, x, y, fill, stroke = "") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.38);
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawStaffScene(ctx, width, height, songTimeMs) {
  const left = width * 0.08;
  const right = width * 0.94;
  const staffLineSpacing = Math.max(24, height * 0.048);
  const staffStepSpacing = staffLineSpacing / 2;
  const bottomLineY = height * 0.61;
  const referenceNote = getReferenceNote(songTimeMs);
  const focusIndex = referenceNote ? referenceNote.index : 0;
  const focusProgress = getReferenceProgress(songTimeMs);
  const anchorX = width * 0.34;
  const spacing = Math.max(82, width * 0.095);

  for (let line = 0; line < 5; line += 1) {
    const y = bottomLineY - line * staffLineSpacing;
    ctx.strokeStyle = STUDIO_COLORS.gridStaff;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  ctx.fillStyle = STUDIO_COLORS.muted;
  ctx.textAlign = "left";
  ctx.font = '20px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText("Treble staff", left, bottomLineY - staffLineSpacing * 5.3);

  for (const note of state.chart) {
    const x = anchorX + (note.index - focusIndex - focusProgress) * spacing;
    if (x < left - 42 || x > right + 42) {
      continue;
    }

    const slot = getStaffSlotForMidi(note.targetMidi);
    const y = getStaffYForMidi(note.targetMidi, bottomLineY, staffStepSpacing);
    let fill = "rgba(248, 250, 252, 0.78)";
    let glow = "";
    const isHovered = state.hoveredCanvasNoteIndex === note.index;

    if (note.grade === "perfect" || note.grade === "good") {
      fill = STUDIO_COLORS.teal;
      glow = STUDIO_COLORS.tealGlow;
    } else if (note.grade === "miss") {
      fill = STUDIO_COLORS.rose;
      glow = STUDIO_COLORS.roseGlow;
    } else if (referenceNote && note.index === referenceNote.index) {
      fill = STUDIO_COLORS.gold;
      glow = STUDIO_COLORS.goldGlow;
    } else if (note.index < focusIndex) {
      fill = "rgba(248, 250, 252, 0.34)";
    }

    drawLedgerLines(ctx, x, slot, bottomLineY, staffStepSpacing);
    ctx.save();
    if (glow) {
      ctx.shadowBlur = 16;
      ctx.shadowColor = glow;
    }
    drawNoteHead(ctx, x, y, fill, referenceNote && note.index === referenceNote.index ? "#ffffff" : "");
    ctx.restore();

    if (isHovered) {
      drawNoteHead(ctx, x, y, "rgba(0, 0, 0, 0)", "#8ac8ff");
    }

    const stemUp = note.targetMidi < 71;
    ctx.strokeStyle = fill;
    ctx.lineWidth = referenceNote && note.index === referenceNote.index ? 3.2 : 2.4;
    ctx.beginPath();
    if (stemUp) {
      ctx.moveTo(x + 12, y);
      ctx.lineTo(x + 12, y - 54);
    } else {
      ctx.moveTo(x - 12, y);
      ctx.lineTo(x - 12, y + 54);
    }
    ctx.stroke();

    const { accidental } = splitNoteName(note.targetMidi);
    if (accidental) {
      ctx.fillStyle = STUDIO_COLORS.text;
      ctx.textAlign = "center";
      ctx.font = '24px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
      ctx.fillText(accidental, x - 24, y + 7);
    }

    registerCanvasNoteHitRegion(note, x - 34, y - 58, 68, 116);
  }

  if (referenceNote) {
    const durationMs = Math.max(1, referenceNote.endMs - referenceNote.startMs);
    const heldMs = clamp(referenceNote.matchedMs, 0, durationMs);
    const progress = state.progressionMode === "step"
      ? clamp(heldMs / durationMs, 0, 1)
      : getReferenceProgress(songTimeMs);
    const barX = left;
    const barY = height * 0.83;
    const barWidth = width * 0.36;
    const barHeight = 18;

    ctx.fillStyle = "rgba(248, 250, 252, 0.08)";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = STUDIO_COLORS.gold;
    ctx.shadowBlur = 14;
    ctx.shadowColor = STUDIO_COLORS.goldGlow;
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    ctx.shadowBlur = 0;

    ctx.fillStyle = STUDIO_COLORS.text;
    ctx.textAlign = "left";
    ctx.font = '22px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
    ctx.fillText(`Target ${midiToNoteName(referenceNote.targetMidi)}`, left, barY - 12);

    ctx.fillStyle = STUDIO_COLORS.muted;
    ctx.font = '19px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
    ctx.fillText(
      state.progressionMode === "step"
        ? `Hold ${Math.round(heldMs)} / ${Math.round(durationMs)} ms to move on`
        : `Note progress ${Math.round(progress * 100)}%`,
      left,
      barY + 44
    );
  }

  if (Number.isFinite(state.pitch.midiRounded)) {
    const playerX = width * 0.86;
    const playerY = getStaffYForMidi(state.pitch.midiRounded, bottomLineY, staffStepSpacing);
    const playerSlot = getStaffSlotForMidi(state.pitch.midiRounded);
    drawLedgerLines(ctx, playerX, playerSlot, bottomLineY, staffStepSpacing);
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = STUDIO_COLORS.skyGlow;
    drawNoteHead(ctx, playerX, playerY, "#8ac8ff", "#dff4ff");
    ctx.restore();
  }

  ctx.textAlign = "right";
  ctx.fillStyle = STUDIO_COLORS.muted;
  ctx.font = '22px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText(`Tolerance +/-${state.toleranceCents} cents`, width - 28, height - 34);
}

function drawLaneScene(ctx, width, height, songTimeMs) {
  const padding = Math.max(82, width * 0.07);
  const hitLineY = height - 122;
  const scrollPixelsPerMs = Math.max(0.15, height / 4300);
  const referenceNote = getReferenceNote(songTimeMs);

  ctx.strokeStyle = STUDIO_COLORS.gold;
  ctx.lineWidth = 3;
  ctx.shadowColor = STUDIO_COLORS.goldGlow;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(padding, hitLineY);
  ctx.lineTo(width - padding, hitLineY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = STUDIO_COLORS.gold;
  ctx.textAlign = "left";
  ctx.font = '18px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText(state.progressionMode === "step" ? "HOLD TO ADVANCE" : "PLAY HERE", padding, hitLineY - 14);

  for (const note of state.chart) {
    const x = noteToX(note.targetMidi, width, padding);
    const noteTop = hitLineY - (note.endMs - songTimeMs) * scrollPixelsPerMs;
    const noteBottom = hitLineY - (note.startMs - songTimeMs) * scrollPixelsPerMs;
    const rectHeight = Math.max(18, noteBottom - noteTop);

    if (noteBottom < -70 || noteTop > height + 70) {
      continue;
    }

    let fill = STUDIO_COLORS.goldSoft;
    let glow = "";
    const isHovered = state.hoveredCanvasNoteIndex === note.index;
    if (note.grade === "perfect" || note.grade === "good") {
      fill = STUDIO_COLORS.teal;
      glow = STUDIO_COLORS.tealGlow;
    } else if (note.grade === "miss") {
      fill = STUDIO_COLORS.rose;
      glow = STUDIO_COLORS.roseGlow;
    }

    const isFocus = referenceNote && note.index === referenceNote.index;
    if (isFocus && note.grade === "pending") {
      fill = STUDIO_COLORS.gold;
      glow = STUDIO_COLORS.goldGlow;
    }

    ctx.fillStyle = fill;
    ctx.save();
    if (glow) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = glow;
    }
    ctx.globalAlpha = note.grade === "pending" ? 0.92 : 0.84;
    const noteWidth = isFocus ? 48 : 40;
    const noteLeft = x - noteWidth / 2;
    ctx.fillRect(noteLeft, noteTop, noteWidth, rectHeight);
    ctx.restore();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = isHovered ? STUDIO_COLORS.sky : (isFocus ? STUDIO_COLORS.text : "rgba(248, 250, 252, 0.08)");
    ctx.lineWidth = isHovered ? 2.4 : (isFocus ? 2.2 : 1);
    ctx.strokeRect(noteLeft, noteTop, noteWidth, rectHeight);

    if (rectHeight > 24) {
      ctx.fillStyle = STUDIO_COLORS.surfaceInk;
      ctx.textAlign = "center";
      ctx.font = '15px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
      ctx.fillText(midiToNoteName(note.targetMidi), x, noteBottom - 8);
    }

    registerCanvasNoteHitRegion(note, noteLeft, noteTop, noteWidth, rectHeight);
  }

  if (Number.isFinite(state.pitch.midiFloat)) {
    const hornX = noteToX(state.pitch.midiFloat, width, padding);
    ctx.fillStyle = STUDIO_COLORS.sky;
    ctx.shadowBlur = 12;
    ctx.shadowColor = STUDIO_COLORS.skyGlow;
    ctx.beginPath();
    ctx.arc(hornX, hitLineY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(223, 244, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hornX, hitLineY, 21, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textAlign = "right";
  ctx.fillStyle = STUDIO_COLORS.muted;
  ctx.font = '22px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText(`Tolerance +/-${state.toleranceCents} cents`, width - 28, height - 34);
}

function drawScene(songTimeMs) {
  const ctx = canvasContext;
  const { width, height } = elements.canvas;
  resetCanvasHitRegions();
  drawBackground(ctx, width, height, { showPitchGrid: state.practiceContext === "key" || state.viewMode === "lane" });

  if (state.practiceContext === "key") {
    drawKeyLockScene(ctx, width, height);
    drawPitchCompareRail(ctx, width, height, songTimeMs);
    return;
  }

  if (!state.chartReady) {
    drawEmptyStage(ctx, width, height);
    return;
  }

  if (state.viewMode === "staff") {
    drawStaffScene(ctx, width, height, songTimeMs);
  } else {
    drawLaneScene(ctx, width, height, songTimeMs);
  }

  drawPitchCompareRail(ctx, width, height, songTimeMs);
  drawCountInOverlay(ctx, width, height, songTimeMs);
}

function runFrame() {
  const now = performance.now();
  const frameDeltaMs = state.lastFrameMs ? now - state.lastFrameMs : 16;
  state.lastFrameMs = now;

  updatePitchState();

  if (state.practiceContext === "key") {
    updateKeyModeTracking();
  }

  if (state.running) {
    if (state.currentSongTimeMs < 0) {
      const countInTimeMs = now - state.songStartPerfMs;
      if (countInTimeMs < 0) {
        state.currentSongTimeMs = countInTimeMs;
        setSessionStatus(`Count-in: ${Math.ceil(Math.abs(state.currentSongTimeMs) / 1000)}`);
      } else if (state.progressionMode === "step") {
        state.currentSongTimeMs = state.chart[0]?.startMs ?? 0;
      } else {
        state.currentSongTimeMs = countInTimeMs;
      }
    } else {
      if (state.progressionMode === "step") {
        updateScoringStep(frameDeltaMs);
      } else {
        state.currentSongTimeMs = now - state.songStartPerfMs;
        updateScoring(state.currentSongTimeMs, frameDeltaMs);
      }
      const referenceNote = getActiveWindowNote(state.currentSongTimeMs);
      setSessionStatus(
        state.progressionMode === "step"
          ? (referenceNote
            ? `Practice mode. Hold ${midiToNoteName(referenceNote.targetMidi)} correctly to unlock the next note.`
            : "Practice complete.")
          : (referenceNote
            ? `Run mode. Enter ${midiToNoteName(referenceNote.targetMidi)} at the line.`
            : "Run complete.")
      );
    }

    if (state.currentSongTimeMs >= state.chartDurationMs) {
      stopSession();
      setSessionStatus("Run complete. Review your accuracy and try another tune.");
    }
  }

  updateWorkflowUI();
  updateLiveHud();
  drawScene(state.currentSongTimeMs);
  state.frameHandle = requestAnimationFrame(runFrame);
}

function resizeCanvas() {
  const frame = elements.canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.round(frame.width * ratio);
  const height = Math.round((frame.width * 9) / 16 * ratio);

  if (elements.canvas.width !== width || elements.canvas.height !== height) {
    elements.canvas.width = width;
    elements.canvas.height = height;
    drawScene(state.currentSongTimeMs);
  }
}

function bindEvents() {
  elements.loadWarmupBtn.addEventListener("click", () => {
    if (!state.library.length) {
      setLibraryStatus("Song library is still loading.");
      return;
    }
    void loadBuiltInSong("concert-bb-scale");
  });

  elements.midiInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) {
      void handleMidiFile(file);
    }
  });

  elements.audioInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) {
      void handleAudioFile(file);
    }
  });

  elements.trackSelect.addEventListener("change", (event) => {
    stopSession();
    selectTrack(event.target.value);
  });

  elements.viewLaneBtn.addEventListener("click", () => {
    state.viewMode = "lane";
    updateWorkflowUI();
    updateLiveHud();
    drawScene(state.currentSongTimeMs);
  });

  elements.viewStaffBtn.addEventListener("click", () => {
    state.viewMode = "staff";
    updateWorkflowUI();
    updateLiveHud();
    drawScene(state.currentSongTimeMs);
  });

  elements.modeFlowBtn.addEventListener("click", () => {
    if (state.progressionMode === "flow") {
      return;
    }
    stopSession();
    state.progressionMode = "flow";
    updateWorkflowUI();
    updateLiveHud();
    drawScene(state.currentSongTimeMs);
    setSessionStatus("Flowing Run mode enabled.");
  });

  elements.modeStepBtn.addEventListener("click", () => {
    if (state.progressionMode === "step") {
      return;
    }
    stopSession();
    state.progressionMode = "step";
    updateWorkflowUI();
    updateLiveHud();
    drawScene(state.currentSongTimeMs);
    setSessionStatus("Wait for Correct Note mode enabled.");
  });

  elements.sessionChartBtn.addEventListener("click", () => {
    if (state.practiceContext === "chart") {
      return;
    }
    stopSession();
    setPracticeContext("chart", { statusMessage: "Chart session restored." });
  });

  elements.sessionKeyBtn.addEventListener("click", () => {
    if (state.practiceContext === "key") {
      return;
    }
    stopSession();
    setPracticeContext("key", {
      resetKeyStats: true,
      statusMessage: `${getKeyModeLabel()} key lock ready. Stay inside the palette.`,
    });
  });

  elements.keyRootSelect.addEventListener("change", (event) => {
    state.keyMode.rootPc = Number(event.target.value);
    resetKeyModeStats();
    setPracticeContext("key", {
      statusMessage: `${getKeyModeLabel()} key lock ready. Stay inside the palette.`,
    });
  });

  elements.keyPaletteSelect.addEventListener("change", (event) => {
    state.keyMode.paletteId = event.target.value;
    resetKeyModeStats();
    setPracticeContext("key", {
      statusMessage: `${getKeyModeLabel()} key lock ready. Stay inside the palette.`,
    });
  });

  elements.randomKeyBtn.addEventListener("click", () => {
    state.keyMode.rootPc = Math.floor(Math.random() * 12);
    elements.keyRootSelect.value = String(state.keyMode.rootPc);
    resetKeyModeStats();
    setPracticeContext("key", {
      statusMessage: `${getKeyModeLabel()} key lock ready. New key selected.`,
    });
  });

  elements.resetKeyModeBtn.addEventListener("click", () => {
    resetKeyModeStats();
    updateScoreboard();
    updateSongMeta();
    setSessionStatus(`${getKeyModeLabel()} key lock meter reset.`);
  });

  elements.transposeSelect.addEventListener("change", (event) => {
    stopSession();
    state.transpose = Number(event.target.value);
    updateChartTargets();
    updateSelectedSongCard();
    updateWorkflowUI();
    updateLiveHud();
    drawScene(state.currentSongTimeMs);
    setSessionStatus("Chart transpose updated.");
  });

  elements.toleranceSelect.addEventListener("change", (event) => {
    state.toleranceCents = Number(event.target.value);
    updateLiveHud();
    drawScene(state.currentSongTimeMs);
  });

  elements.micButton.addEventListener("click", () => {
    void enableMicrophone();
  });

  elements.hearTargetBtn.addEventListener("click", () => {
    void playTargetPreview();
  });

  elements.canvas.addEventListener("mousemove", updateCanvasHoverState);
  elements.canvas.addEventListener("mouseleave", clearCanvasHoverState);
  elements.canvas.addEventListener("click", (event) => {
    if (!(state.chartReady || state.practiceContext === "key")) {
      return;
    }

    const note = getCanvasNoteAtPoint(getCanvasPoint(event));
    if (note) {
      void playChartNotePreview(note, "chart note");
    }
  });

  elements.startButton.addEventListener("click", () => {
    void startSession();
  });

  elements.stopButton.addEventListener("click", stopSession);
  window.addEventListener("resize", resizeCanvas);
}

function init() {
  setupTransposeOptions();
  setupKeyModeOptions();
  resetScoreboard();
  resetKeyModeStats();
  resetPitchState();
  resetTunerDisplay();
  updateSelectedSongCard();
  updateWorkflowUI();
  updateLiveHud();
  bindEvents();
  resizeCanvas();
  drawScene(0);
  state.lastFrameMs = performance.now();
  state.frameHandle = requestAnimationFrame(runFrame);
  void initializeLibrary();
}

init();
