// Shared script for sub-pages: scaling, back button, audio (mute persisted).
import { installScaler } from "./scale.js?v=1785825000";
import { installCursor } from "./cursor.js?v=1785825000";

installCursor();

const stage = document.querySelector(".subpage-stage");
if (stage) installScaler(stage);

const STORAGE_KEY = "wiiMuted";

// Mute toggle (rendered on subpages for mobile): flips the shared flag that
// every play() call reads at click time. No bgm runs on subpages.
const muteBtn = document.getElementById("mute-toggle");
if (muteBtn) {
  const syncIcon = () => {
    const m = localStorage.getItem(STORAGE_KEY) === "1";
    muteBtn.textContent = m ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-pressed", String(m));
  };
  syncIcon();
  muteBtn.addEventListener("click", () => {
    const m = localStorage.getItem(STORAGE_KEY) === "1";
    localStorage.setItem(STORAGE_KEY, m ? "0" : "1");
    syncIcon();
  });
}

const backBtn = document.querySelector(".wii-menu-btn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    const id = backBtn.dataset.channelId;
    const muted = localStorage.getItem(STORAGE_KEY) === "1";
    const play = (src) => {
      if (muted) return Promise.resolve();
      return new Promise((resolve) => {
        const h = new Howl({ src: [src], volume: 0.6, onend: resolve, onloaderror: resolve });
        h.play();
      });
    };
    const flash = document.getElementById("flash-overlay");
    play("assets/audio/back.wav");
    gsap.to(flash, {
      opacity: 1,
      duration: 0.15,
      onComplete: () => {
        // Return id travels via sessionStorage, NOT a ?return= query param:
        // each query variant of index.html is a separate HTTP cache entry, so
        // stale variants could serve an old menu (missing newer channels).
        try { sessionStorage.setItem("wiiReturn", id); } catch (_) {}
        window.location.href = "index.html";
      },
    });
  });
}
