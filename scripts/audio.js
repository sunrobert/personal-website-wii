const STORAGE_KEY = "wiiMuted";
const HOVER_COOLDOWN_MS = 50;

let bgm;
const sfx = {};
let lastHoverTs = 0;
let muted = localStorage.getItem(STORAGE_KEY) === "1";
let startedBgm = false;

function mkSfx(src) {
  return new Howl({ src: [src], volume: 0.6, onloaderror: (_, err) => console.warn("SFX load failed", src, err) });
}

export function initAudio() {
  bgm = new Howl({
    src: ["assets/audio/bgm.mp3"],
    loop: true,
    html5: true,
    volume: 0,
    onloaderror: (_, err) => console.warn("BGM load failed", err),
  });
  // WAV (not mp3): instant decode with no encoder padding, and the clips are
  // pre-trimmed to remove leading silence so SFX fire with no perceptible delay.
  sfx.hover   = mkSfx("assets/audio/hover.wav");
  sfx.select  = mkSfx("assets/audio/select.wav");
  sfx.back    = mkSfx("assets/audio/back.wav");
  sfx.startup = mkSfx("assets/audio/startup.wav");

  const unlock = () => {
    if (!startedBgm) {
      startedBgm = true;
      playStartup();
      if (!muted) fadeInBgm();
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);

  const btn = document.getElementById("mute-toggle");
  btn.textContent = muted ? "🔇" : "🔊";
  btn.setAttribute("aria-pressed", String(muted));
  btn.addEventListener("click", toggleMute);
}

function fadeInBgm() {
  // html5 playback starts asynchronously, so fading on the same tick as play()
  // races the start and leaves the volume pinned at the `from` value (silent).
  // Wait for the actual `play` event before ramping the volume up.
  if (bgm.playing()) {
    bgm.fade(bgm.volume(), 0.4, 2000);
    return;
  }
  bgm.once("play", () => bgm.fade(0, 0.4, 2000));
  bgm.play();
}

function playStartup() {
  if (muted) return;
  try { sfx.startup.play(); } catch (_) {}
}

export function playHover() {
  if (muted) return;
  const now = performance.now();
  if (now - lastHoverTs < HOVER_COOLDOWN_MS) return;
  lastHoverTs = now;
  sfx.hover.play();
}

export function playSelect() { if (muted) return; sfx.select.play(); }
export function playBack() { if (muted) return; sfx.back.play(); }

export function toggleMute() {
  muted = !muted;
  localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  const btn = document.getElementById("mute-toggle");
  btn.textContent = muted ? "🔇" : "🔊";
  btn.setAttribute("aria-pressed", String(muted));
  if (muted) {
    bgm.fade(bgm.volume(), 0, 400);
  } else {
    if (startedBgm) {
      if (!bgm.playing()) bgm.play();
      bgm.fade(0, 0.4, 800);
    }
  }
}

export function isMuted() { return muted; }
