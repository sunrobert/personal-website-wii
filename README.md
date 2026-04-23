# Wii Menu Portfolio

Personal portfolio styled as the Nintendo Wii Main Menu.

## Local dev

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

```
npx vercel --prod
```

## Structure

- `index.html` — the Wii channels menu
- `<channel>.html` — sub-pages (social, writings, books, mii-out, photography, messages)
- `styles/` — CSS (main, channel, bottom-bar, mute, subpage)
- `scripts/` — vanilla JS modules (scale, channels, nav, bottom-bar, clock, audio, transitions, subpage, menu)
- `assets/` — channel art, fonts, audio, avatar

## Swap-in placeholders

- **`assets/avatar.jpg`** — currently a generic silhouette; replace with your photo (any square JPG).
- **`assets/audio/*.mp3`** — currently absent; drop in `bgm.mp3`, `hover.mp3`, `select.mp3`, `back.mp3`, `startup.mp3`. See `assets/audio/TODO.md`.
- **`assets/channels/*.png`** — gradient placeholders; replace with real artwork (560×280 recommended).

## Tests

```
bun test tests/
```
