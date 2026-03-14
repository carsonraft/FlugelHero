# Flugel Hero

Browser prototype for a flugelhorn rhythm game:

- ships with a built-in library of practice MIDIs
- lets you upload your own melody MIDI
- listens to your microphone and judges whether you are matching the chart
- optionally plays backing audio or a stem while you perform

## Run it

This needs `localhost` because browser microphone access is blocked on plain `file://` pages.

```bash
cd /Users/carsonraft/Desktop/FlugelHero
python3 -m http.server 4173
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Included song library

The built-in catalog lives in [`library/songs.json`](/Users/carsonraft/Desktop/FlugelHero/library/songs.json) and currently includes:

- Warm-Up Ladder
- Ode to Joy
- Amazing Grace
- When the Saints
- Greensleeves
- Interval Builder

These are all generated as real MIDI files under [`library/midis`](/Users/carsonraft/Desktop/FlugelHero/library/midis) so the app exercises the same import path as an uploaded chart.

## How it works

- MIDI parsing and gameplay logic live in [`app.js`](/Users/carsonraft/Desktop/FlugelHero/app.js).
- The game converts the chosen melody track into a monophonic note highway.
- Mic pitch detection uses a browser `AnalyserNode` plus an AMDF-style detector tuned for brass fundamentals.
- Notes are judged by how much of each note duration matches the target pitch within the selected cents window.

## Regenerating the library

If you want to add or edit built-in tunes, update [`tools/generate-midi-library.mjs`](/Users/carsonraft/Desktop/FlugelHero/tools/generate-midi-library.mjs) and run:

```bash
cd /Users/carsonraft/Desktop/FlugelHero
node tools/generate-midi-library.mjs
```

## Practical notes

- Built-in charts are in concert pitch.
- If your uploaded MIDI came from a B-flat trumpet or flugelhorn part, set transpose to `-2`.
- Use a dry mic signal. Room bleed from the backing track will confuse pitch detection.
- Best results come from a single melody track, not a dense piano or orchestral reduction.
