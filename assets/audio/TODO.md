# Wii Audio Assets

All runtime audio files are present:

- `bgm.mp3` — Wii Menu theme, looped (fades in on first user gesture)
- `hover.wav` — channel hover SFX
- `select.wav` — channel select SFX
- `back.wav` — return SFX
- `startup.wav` — power-on jingle

The audio system tolerates missing files (Howler logs a warning to the console),
so any SFX can be swapped by dropping in a replacement with the same name.

## SFX are trimmed WAVs

The SFX are `.wav`, not `.mp3`, on purpose: WAV decodes instantly with no encoder
padding. The source mp3s also had 0.8–4.1s of leading silence baked in, which made
every sound fire late. They were trimmed to the sound onset (10ms lead pad) and
re-saved as PCM WAV, so SFX now fire with no perceptible delay.

## Source

The four SFX were pulled from the Internet Archive "all-wii-sounds" collection
(https://archive.org/details/all-wii-sounds), trimmed, and renamed:

| Runtime name  | Source file         | Trimmed length |
|---------------|---------------------|----------------|
| `hover.wav`   | `Click.mp3`         | 154ms          |
| `select.wav`  | `Click Channel.mp3` | 484ms          |
| `back.wav`    | `Back.mp3`          | 355ms          |
| `startup.wav` | `Menu Load.mp3`     | 1814ms         |

These are Nintendo's copyrighted sounds — fine for a personal fan project. Swap any
of them with files from `sounds.spriters-resource.com/wii/wiimenu/` to taste (trim
leading silence first, or they'll lag).
