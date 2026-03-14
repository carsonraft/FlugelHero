const elements = {
  scrollLibraryBtn: document.getElementById("scrollLibraryBtn"),
  loadWarmupBtn: document.getElementById("loadWarmupBtn"),
  librarySection: document.getElementById("librarySection"),
  libraryGrid: document.getElementById("libraryGrid"),
  libraryStatus: document.getElementById("libraryStatus"),
  midiInput: document.getElementById("midiInput"),
  audioInput: document.getElementById("audioInput"),
  trackSelectWrap: document.getElementById("trackSelectWrap"),
  trackSelect: document.getElementById("trackSelect"),
  transposeSelect: document.getElementById("transposeSelect"),
  toleranceSelect: document.getElementById("toleranceSelect"),
  micButton: document.getElementById("micButton"),
  startButton: document.getElementById("startButton"),
  stopButton: document.getElementById("stopButton"),
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
  stepSong: document.getElementById("stepSong"),
  stepSongState: document.getElementById("stepSongState"),
  stepMic: document.getElementById("stepMic"),
  stepMicState: document.getElementById("stepMicState"),
  stepPlay: document.getElementById("stepPlay"),
  stepPlayState: document.getElementById("stepPlayState"),
  stageTitle: document.getElementById("stageTitle"),
  sessionStatus: document.getElementById("sessionStatus"),
  liveTargetNote: document.getElementById("liveTargetNote"),
  livePlayerNote: document.getElementById("livePlayerNote"),
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

const LIBRARY_MANIFEST_PATH = "./library/songs.json";

const state = {
  library: [],
  selectedLibrarySongId: null,
  selection: null,
  tracks: [],
  selectedTrackKey: "",
  activeTrackLabel: "",
  chart: [],
  chartBaseNotes: [],
  chartReady: false,
  chartDurationMs: 0,
  chartName: "",
  chartSource: "",
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
  micStream: null,
  micReady: false,
  timeDomainBuffer: null,
};

const canvasContext = elements.canvas.getContext("2d");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatClockMs(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function midiToNoteName(midi) {
  const rounded = Math.round(midi);
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${name}${octave}`;
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function frequencyToMidi(frequency) {
  return 69 + 12 * Math.log2(frequency / 440);
}

function prettifyFileName(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

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
  return state.chart.find((note) => !note.judged && note.endMs >= songTimeMs - 80) || null;
}

function getActiveWindowNote(songTimeMs = state.currentSongTimeMs) {
  return state.chart.find((note) => songTimeMs >= note.startMs && songTimeMs <= note.endMs) || getReferenceNote(songTimeMs);
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

function applyStepState(element, value) {
  element.dataset.state = value;
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
  const accuracy = state.score.judged ? Math.round((state.score.holdSum / state.score.judged) * 100) : 0;
  elements.scoreValue.textContent = String(state.score.points);
  elements.streakValue.textContent = `Streak ${state.score.streak}`;
  elements.accuracyValue.textContent = `${accuracy}%`;
  elements.notesValue.textContent = `${state.score.hits} / ${state.score.judged} notes`;
}

function updateSongMeta() {
  if (!state.chartReady) {
    elements.songMeta.textContent = "No chart loaded";
    elements.timeMeta.textContent = "00:00 / 00:00";
    return;
  }

  const parts = [state.selection?.title || state.chartName, `${state.chart.length} notes`, getChartDurationLabel()];
  if (state.audioFileName) {
    parts.push(`Backing ${state.audioFileName}`);
  }

  elements.songMeta.textContent = parts.join(" • ");
  elements.timeMeta.textContent = `${formatClockMs(state.currentSongTimeMs)} / ${getChartDurationLabel()}`;
}

function updateSelectedSongCard() {
  if (!state.selection) {
    elements.selectedSongTitle.textContent = "No song selected";
    elements.selectedSongDetail.textContent = "Pick a built-in tune or upload a MIDI to create a playable chart.";
    elements.selectedSourceTag.textContent = "Select a source";
    elements.selectedDifficultyTag.textContent = "Difficulty";
    elements.selectedRangeTag.textContent = "Range";
    elements.selectedDurationTag.textContent = "Length";
    return;
  }

  elements.selectedSongTitle.textContent = state.selection.title;

  const trackDetails = state.activeTrackLabel && state.tracks.length > 1 ? ` Active track: ${state.activeTrackLabel}.` : "";
  const description = state.selection.description || "Chart ready.";
  elements.selectedSongDetail.textContent = `${description}${trackDetails}`;

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
  const songReady = state.chartReady;
  const micReady = state.micReady;
  const playReady = songReady && micReady;

  applyStepState(elements.stepSong, songReady ? "ready" : "current");
  elements.stepSongState.textContent = songReady ? (state.selection?.title || "Song loaded") : "Choose a built-in tune";

  applyStepState(elements.stepMic, micReady ? "ready" : songReady ? "current" : "idle");
  elements.stepMicState.textContent = micReady ? "Mic is listening" : songReady ? "Enable microphone" : "Waiting for a song";

  applyStepState(elements.stepPlay, state.running ? "live" : playReady ? "ready" : "idle");
  elements.stepPlayState.textContent = state.running ? "Playing now" : playReady ? "Press Start Run" : "Need song + mic";

  if (!songReady) {
    elements.nextActionText.textContent = "Choose a built-in song or upload a MIDI.";
  } else if (!micReady) {
    elements.nextActionText.textContent = "Enable the microphone so the horn can be tracked.";
  } else if (!state.running) {
    elements.nextActionText.textContent = "Press Start Run. You will get a two-beat count-in.";
  } else if (state.currentSongTimeMs < 0) {
    elements.nextActionText.textContent = `Count-in: ${Math.ceil(Math.abs(state.currentSongTimeMs) / 1000)}`;
  } else {
    elements.nextActionText.textContent = "Match the target note when the bar reaches the line.";
  }

  elements.trackSelectWrap.classList.toggle("is-hidden", state.tracks.length <= 1);
  elements.micButton.textContent = state.micReady ? "Microphone Ready" : "Enable Microphone";
  elements.startButton.disabled = !playReady || state.running;
  elements.stopButton.disabled = !state.running;
}

function getLiveCoachMessage(referenceNote) {
  if (!referenceNote) {
    return "Finish the phrase and hold the last note cleanly.";
  }

  if (!state.micReady) {
    return "Enable the microphone to see your blue note marker.";
  }

  if (!Number.isFinite(state.pitch.midiFloat)) {
    return "Play a note to place your blue marker on the lane.";
  }

  const centsOff = Math.round((state.pitch.midiFloat - referenceNote.targetMidi) * 100);
  if (Math.abs(centsOff) <= Math.round(state.toleranceCents * 0.65)) {
    return "Centered. Hold it through the full bar.";
  }

  return centsOff < 0 ? `${Math.abs(centsOff)} cents flat. Bring the pitch up.` : `${centsOff} cents sharp. Relax it down.`;
}

function updateLiveHud() {
  const referenceNote = getReferenceNote(state.currentSongTimeMs);
  const playerLabel = Number.isFinite(state.pitch.midiRounded) ? midiToNoteName(state.pitch.midiRounded) : "--";

  elements.liveTargetNote.textContent = referenceNote ? midiToNoteName(referenceNote.targetMidi) : "--";
  elements.livePlayerNote.textContent = playerLabel;

  if (!state.chartReady) {
    elements.stageTitle.textContent = "Pick a song to light up the lane";
    elements.overlayPrimary.textContent = "The bright line is where you play.";
    elements.overlaySecondary.textContent = "Choose a built-in song, enable the mic, then start a run.";
  } else if (!state.micReady) {
    elements.stageTitle.textContent = `${state.selection?.title || "Song"} is ready`;
    elements.overlayPrimary.textContent = referenceNote
      ? `First target: ${midiToNoteName(referenceNote.targetMidi)}`
      : "Song loaded";
    elements.overlaySecondary.textContent = "Enable the microphone to show your blue note marker.";
  } else if (!state.running) {
    elements.stageTitle.textContent = `${state.selection?.title || "Song"} is armed`;
    elements.overlayPrimary.textContent = "Press Start Run for a two-beat count-in.";
    elements.overlaySecondary.textContent = "Play concert pitch when each bar reaches the bright line.";
  } else if (state.currentSongTimeMs < 0) {
    elements.stageTitle.textContent = `Count-in ${Math.ceil(Math.abs(state.currentSongTimeMs) / 1000)}`;
    elements.overlayPrimary.textContent = referenceNote
      ? `First note: ${midiToNoteName(referenceNote.targetMidi)}`
      : "Count-in running";
    elements.overlaySecondary.textContent = "Take a breath. Enter when the first bar hits the line.";
  } else {
    elements.stageTitle.textContent = referenceNote
      ? `Play ${midiToNoteName(referenceNote.targetMidi)} at the line`
      : "Finish the phrase";
    elements.overlayPrimary.textContent = getLiveCoachMessage(referenceNote);
    elements.overlaySecondary.textContent = `Pitch window: +/-${state.toleranceCents} cents.`;
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

  const noteValues = state.chart.map((note) => note.targetMidi);
  state.renderMinMidi = noteValues.length ? Math.floor(Math.min(...noteValues)) - 1 : 55;
  state.renderMaxMidi = noteValues.length ? Math.ceil(Math.max(...noteValues)) + 1 : 72;
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
  updateChartTargets();

  resetScoreboard();
  updateSelectedSongCard();
  updateWorkflowUI();
  updateLiveHud();

  setSessionStatus(
    state.micReady
      ? `${state.chartName} loaded. Press Start Run when you are ready.`
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
    empty.innerHTML = "<span>No built-in songs loaded</span><small>Serve this app on localhost so the MIDI library can be fetched.</small>";
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

async function loadBuiltInSong(songId) {
  const song = state.library.find((entry) => entry.id === songId);
  if (!song) {
    setLibraryStatus("That built-in song is not available.");
    return;
  }

  setLibraryStatus(`Loading ${song.title}...`);

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

    setLibraryStatus(`${state.library.length} built-in practice MIDIs ready.`);
    setSessionStatus(
      state.micReady
        ? `${song.title} loaded. Press Start Run when you are ready.`
        : `${song.title} loaded. Enable the microphone to continue.`
    );
  } catch (error) {
    setLibraryStatus(`Could not load ${song.title}: ${error.message}`);
  }
}

async function initializeLibrary() {
  try {
    setLibraryStatus("Loading built-in practice MIDIs...");
    const response = await fetch(LIBRARY_MANIFEST_PATH);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    state.library = await response.json();
    renderLibrary();
    setLibraryStatus(`${state.library.length} built-in practice MIDIs ready.`);

    if (state.library.length) {
      await loadBuiltInSong(state.library[0].id);
    }
  } catch (error) {
    state.library = [];
    renderLibrary();
    setLibraryStatus("Built-in library failed to load. Serve the app on localhost and reload.");
    setSessionStatus("The built-in song library could not load.");
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
        ? `${file.name} loaded. Press Start Run when you are ready.`
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
    setSessionStatus("Load a song before adding backing audio.");
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

    const audioContext = new AudioContext();
    await audioContext.resume();

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    state.audioContext = audioContext;
    state.analyser = analyser;
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
        ? "Microphone ready. Press Start Run when you want the count-in."
        : "Microphone ready. Choose a song from the library."
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
  const buffer = state.timeDomainBuffer;
  let amplitudeSum = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    amplitudeSum += buffer[index] * buffer[index];
  }

  const rms = Math.sqrt(amplitudeSum / buffer.length);
  if (rms < 0.012) {
    return null;
  }

  const minFrequency = 140;
  const maxFrequency = 1100;
  const minLag = Math.floor(sampleRate / maxFrequency);
  const maxLag = Math.floor(sampleRate / minFrequency);
  const differences = [];
  let bestLag = -1;
  let bestDifference = Number.POSITIVE_INFINITY;
  let totalDifference = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let difference = 0;

    for (let index = 0; index < buffer.length - lag; index += 1) {
      difference += Math.abs(buffer[index] - buffer[index + lag]);
    }

    difference /= buffer.length - lag;
    differences[lag] = difference;
    totalDifference += difference;

    if (difference < bestDifference) {
      bestDifference = difference;
      bestLag = lag;
    }
  }

  if (bestLag === -1) {
    return null;
  }

  const averageDifference = totalDifference / (maxLag - minLag + 1);
  const clarity = clamp(1 - bestDifference / averageDifference, 0, 1);
  if (clarity < 0.18) {
    return null;
  }

  const previous = differences[bestLag - 1] ?? differences[bestLag];
  const current = differences[bestLag];
  const next = differences[bestLag + 1] ?? differences[bestLag];
  const denominator = previous + next - 2 * current;
  let refinedLag = bestLag;

  if (Math.abs(denominator) > 1e-6) {
    refinedLag = bestLag + (previous - next) / (2 * denominator);
  }

  const frequency = sampleRate / refinedLag;
  if (!Number.isFinite(frequency) || frequency < minFrequency || frequency > maxFrequency) {
    return null;
  }

  return {
    frequency,
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

async function startSession() {
  if (!state.chartReady || !state.micReady || state.running) {
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
  await state.audioContext.resume();

  if (state.backingBuffer) {
    try {
      const source = state.audioContext.createBufferSource();
      source.buffer = state.backingBuffer;
      source.connect(state.audioContext.destination);
      source.start(state.audioContext.currentTime + state.countInMs / 1000);
      state.backingSource = source;
    } catch (error) {
      setSessionStatus(`Backing audio could not start: ${error.message}`);
    }
  }

  updateWorkflowUI();
  updateLiveHud();
  setSessionStatus("Count-in running. Play when the first bar reaches the line.");
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
  const toleranceSemitones = state.toleranceCents / 100;

  for (const note of state.chart) {
    if (note.judged) {
      continue;
    }

    if (songTimeMs >= note.startMs && songTimeMs <= note.endMs) {
      note.sampledMs += frameDeltaMs;

      if (
        Number.isFinite(state.pitch.midiFloat) &&
        Math.abs(state.pitch.midiFloat - note.targetMidi) <= toleranceSemitones &&
        state.pitch.clarity >= 0.18
      ) {
        note.matchedMs += frameDeltaMs;
        if (note.firstMatchMs === null) {
          note.firstMatchMs = songTimeMs;
        }
      }
    }

    if (songTimeMs > note.endMs + 140) {
      finalizeNote(note);
    }
  }
}

function stopSession() {
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

  for (const note of state.chart) {
    if (!note.judged && state.currentSongTimeMs > note.endMs) {
      finalizeNote(note);
    }
  }

  updateWorkflowUI();
  updateLiveHud();
  setSessionStatus("Run stopped. Adjust the chart or press Start Run to try again.");
  drawScene(state.currentSongTimeMs);
}

function noteToX(midi, width, padding) {
  const span = Math.max(1, state.renderMaxMidi - state.renderMinMidi);
  const normalized = (midi - state.renderMinMidi) / span;
  return padding + normalized * (width - padding * 2);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0f2340");
  gradient.addColorStop(0.5, "#09131f");
  gradient.addColorStop(1, "#040910");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const padding = Math.max(82, width * 0.07);
  for (let midi = state.renderMinMidi; midi <= state.renderMaxMidi; midi += 1) {
    const x = noteToX(midi, width, padding);
    const alpha = midi % 12 === 0 ? 0.24 : 0.08;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = midi % 12 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, 48);
    ctx.lineTo(x, height - 58);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.62)";
  ctx.font = '16px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.textAlign = "center";

  for (let midi = state.renderMinMidi; midi <= state.renderMaxMidi; midi += 1) {
    const x = noteToX(midi, width, padding);
    ctx.fillText(midiToNoteName(midi), x, 30);
  }
}

function drawEmptyStage(ctx, width, height) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
  ctx.textAlign = "center";
  ctx.font = '48px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText("Choose a song to start", width / 2, height / 2 - 12);

  ctx.fillStyle = "rgba(189, 200, 210, 0.86)";
  ctx.font = '24px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText("Built-in MIDIs load from the library on the left.", width / 2, height / 2 + 30);
}

function drawScene(songTimeMs) {
  const ctx = canvasContext;
  const { width, height } = elements.canvas;
  const padding = Math.max(82, width * 0.07);
  const hitLineY = height - 122;
  const scrollPixelsPerMs = Math.max(0.15, height / 4300);

  drawBackground(ctx, width, height);

  if (!state.chartReady) {
    drawEmptyStage(ctx, width, height);
    return;
  }

  const referenceNote = getReferenceNote(songTimeMs);

  ctx.strokeStyle = "rgba(255, 215, 141, 0.96)";
  ctx.lineWidth = 4;
  ctx.shadowColor = "rgba(255, 215, 141, 0.45)";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.moveTo(padding * 0.72, hitLineY);
  ctx.lineTo(width - padding * 0.72, hitLineY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255, 215, 141, 0.9)";
  ctx.textAlign = "left";
  ctx.font = '18px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText("PLAY HERE", padding * 0.72, hitLineY - 12);

  for (const note of state.chart) {
    const x = noteToX(note.targetMidi, width, padding);
    const noteTop = hitLineY - (note.endMs - songTimeMs) * scrollPixelsPerMs;
    const noteBottom = hitLineY - (note.startMs - songTimeMs) * scrollPixelsPerMs;
    const rectHeight = Math.max(18, noteBottom - noteTop);

    if (noteBottom < -70 || noteTop > height + 70) {
      continue;
    }

    let fill = NOTE_COLORS[((note.targetMidi % 12) + 12) % 12];
    if (note.grade === "perfect" || note.grade === "good") {
      fill = "#8af2dd";
    } else if (note.grade === "miss") {
      fill = "#ff8f93";
    }

    const isFocus = referenceNote && note.index === referenceNote.index;
    ctx.fillStyle = fill;
    ctx.globalAlpha = note.grade === "pending" ? 0.92 : 0.8;
    ctx.fillRect(x - (isFocus ? 24 : 20), noteTop, isFocus ? 48 : 40, rectHeight);
    ctx.globalAlpha = 1;

    if (isFocus) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 24, noteTop, 48, rectHeight);
    }

    if (rectHeight > 24) {
      ctx.fillStyle = "#08111d";
      ctx.textAlign = "center";
      ctx.font = '15px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
      ctx.fillText(midiToNoteName(note.targetMidi), x, noteBottom - 8);
    }
  }

  if (Number.isFinite(state.pitch.midiFloat)) {
    const hornX = noteToX(state.pitch.midiFloat, width, padding);
    ctx.fillStyle = "#8ac8ff";
    ctx.beginPath();
    ctx.moveTo(hornX, hitLineY - 38);
    ctx.lineTo(hornX + 16, hitLineY - 10);
    ctx.lineTo(hornX, hitLineY + 18);
    ctx.lineTo(hornX - 16, hitLineY - 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ebf7ff";
    ctx.textAlign = "center";
    ctx.font = '20px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
    ctx.fillText(midiToNoteName(state.pitch.midiRounded), hornX, hitLineY - 48);
  }

  if (referenceNote) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "left";
    ctx.font = '24px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
    ctx.fillText(`Target ${midiToNoteName(referenceNote.targetMidi)}`, 28, height - 34);
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(189, 200, 210, 0.9)";
  ctx.font = '22px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
  ctx.fillText(`Tolerance +/-${state.toleranceCents} cents`, width - 28, height - 34);

  if (state.running && songTimeMs < 0) {
    ctx.fillStyle = "rgba(4, 11, 19, 0.55)";
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 215, 141, 0.92)";
    ctx.arc(width / 2, height / 2, 92, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#201407";
    ctx.textAlign = "center";
    ctx.font = '92px "Avenir Next Condensed", "Franklin Gothic Medium", sans-serif';
    ctx.fillText(String(Math.ceil(Math.abs(songTimeMs) / 1000)), width / 2, height / 2 + 28);
  }
}

function runFrame() {
  const now = performance.now();
  const frameDeltaMs = state.lastFrameMs ? now - state.lastFrameMs : 16;
  state.lastFrameMs = now;

  updatePitchState();

  if (state.running) {
    state.currentSongTimeMs = now - state.songStartPerfMs;

    if (state.currentSongTimeMs < 0) {
      setSessionStatus(`Count-in: ${Math.ceil(Math.abs(state.currentSongTimeMs) / 1000)}`);
    } else {
      updateScoring(state.currentSongTimeMs, frameDeltaMs);
      const referenceNote = getActiveWindowNote(state.currentSongTimeMs);
      setSessionStatus(referenceNote ? `Live. Match ${midiToNoteName(referenceNote.targetMidi)} at the line.` : "Live. Finish the phrase.");
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
  elements.scrollLibraryBtn.addEventListener("click", () => {
    elements.librarySection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.loadWarmupBtn.addEventListener("click", () => {
    if (!state.library.length) {
      setLibraryStatus("Song library is still loading.");
      return;
    }
    void loadBuiltInSong("warmup-ladder");
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

  elements.startButton.addEventListener("click", () => {
    void startSession();
  });

  elements.stopButton.addEventListener("click", stopSession);
  window.addEventListener("resize", resizeCanvas);
}

function init() {
  setupTransposeOptions();
  resetScoreboard();
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
