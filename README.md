# Flugel Hero

Browser prototype for a flugelhorn rhythm game:

- opens with a built-in starter library of scale drills
- ships with a built-in library of practice MIDIs
- lets you upload your own melody MIDI
- can show either a scrolling pitch lane or a treble staff view
- includes a wait mode that only advances when you hold the correct note for its full value
- includes a key-lock mode that checks free improvisation against a chosen palette
- listens to your microphone and judges whether you are matching the chart
- optionally plays backing audio or a stem while you perform

## Run it

Double-clicking [`index.html`](/Users/carsonraft/Desktop/FlugelHero/index.html) now loads an embedded starter library of scales, so the app is no longer empty when opened directly. For reliable microphone permissions across browsers, `localhost` is still the recommended way to run it.

```bash
cd /Users/carsonraft/Desktop/FlugelHero
python3 -m http.server 4173
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Included song library

The built-in catalog lives in [`library/songs.json`](/Users/carsonraft/Desktop/FlugelHero/library/songs.json) and currently includes:

- Concert Bb Scale
- Concert F Scale
- Concert Eb Scale
- Concert Ab Scale
- Concert Bb Blues Scale
- Concert F Blues Scale
- Concert Eb Blues Scale
- Concert Bb Major Pentatonic
- Concert F Major Pentatonic
- Concert C Minor Pentatonic
- Concert G Minor Pentatonic
- Concert Bb Bebop Dominant
- Concert C Dorian
- Concert Bb Mixolydian
- ii-V Into Bb
- Long Tone Centering
- Thirds Ladder
- Bb Arpeggio Slots
- Clarke Cell One
- Chromatic Builder
- Warm-Up Ladder
- Ode to Joy
- Amazing Grace
- When the Saints
- Greensleeves
- Interval Builder

These are all generated as real MIDI files under [`library/midis`](/Users/carsonraft/Desktop/FlugelHero/library/midis) so the app exercises the same import path as an uploaded chart.

## How it works

- MIDI parsing and gameplay logic live in [`app.js`](/Users/carsonraft/Desktop/FlugelHero/app.js).
- The app also bundles starter scale charts directly in [`app.js`](/Users/carsonraft/Desktop/FlugelHero/app.js) so direct-open `file://` sessions still have something playable loaded.
- The game converts the chosen melody track into a monophonic note highway.
- `Pitch Lane` behaves like a rhythm-game highway, while `Music Staff` renders the same melody as notation.
- `Wait for Correct Note` turns the chart into a practice mode: each note resets if the pitch drops before you hold the full duration.
- `Key Lock` turns the app into a free-play checker: pick a concert key and palette, then only in-key notes count.
- Mic pitch detection uses a browser `AnalyserNode`, a filtered brass-focused input path, and a YIN-style detector with harmonic correction.
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
