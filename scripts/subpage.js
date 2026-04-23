// Shared script for sub-pages: scaling, back button, audio (mute persisted).
import { installScaler } from "./scale.js";
import { installCursor } from "./cursor.js";

installCursor();

const stage = document.querySelector(".subpage-stage");
if (stage) installScaler(stage);

const STORAGE_KEY = "wiiMuted";
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
    play("assets/audio/back.mp3");
    gsap.to(flash, {
      opacity: 1,
      duration: 0.15,
      onComplete: () => {
        window.location.href = `index.html?return=${encodeURIComponent(id)}`;
      },
    });
  });
}
