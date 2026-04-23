import { playSelect } from "./audio.js";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Zooms the clicked channel to fill the stage, flashes white, then navigates.
export function zoomIntoChannel(channelEl, href) {
  playSelect();
  const stage = document.getElementById("stage");
  const flash = document.getElementById("flash-overlay");
  const others = Array.from(document.querySelectorAll(".channel")).filter((e) => e !== channelEl);

  const rect = channelEl.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / rect.width;
  const dx = (stageRect.left + stageRect.width / 2) - (rect.left + rect.width / 2);
  const dy = (stageRect.top + stageRect.height / 2) - (rect.top + rect.height / 2);

  if (prefersReducedMotion()) {
    const id = channelEl.dataset.channelId;
    gsap.to(flash, {
      opacity: 1, duration: 0.15,
      onComplete: () => { window.location.href = `${href}?from=${encodeURIComponent(id)}`; },
    });
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      const id = channelEl.dataset.channelId;
      window.location.href = `${href}?from=${encodeURIComponent(id)}`;
    },
  });
  tl.to(others, { opacity: 0, scale: 0.9, duration: 0.25, ease: "power2.in" }, 0);
  tl.to(channelEl, { x: dx, y: dy, scale: scale, duration: 0.35, ease: "expo.in" }, 0);
  tl.to(flash, { opacity: 1, duration: 0.12, ease: "power1.out" }, 0.3);
}

// When arriving at the menu with ?return=<id>, play the reverse.
export function zoomOutToMenu(returnId) {
  const channelEl = document.querySelector(`.channel--active[data-channel-id="${returnId}"]`);
  if (!channelEl) return;

  if (prefersReducedMotion()) {
    const flash = document.getElementById("flash-overlay");
    gsap.to(flash, { opacity: 0, duration: 0.2 });
    return;
  }

  const stage = document.getElementById("stage");
  const flash = document.getElementById("flash-overlay");
  const others = Array.from(document.querySelectorAll(".channel")).filter((e) => e !== channelEl);

  const rect = channelEl.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / rect.width;
  const dx = (stageRect.left + stageRect.width / 2) - (rect.left + rect.width / 2);
  const dy = (stageRect.top + stageRect.height / 2) - (rect.top + rect.height / 2);

  gsap.set(channelEl, { x: dx, y: dy, scale });
  gsap.set(others, { opacity: 0, scale: 0.9 });
  gsap.set(flash, { opacity: 1 });

  const tl = gsap.timeline();
  tl.to(flash, { opacity: 0, duration: 0.15, ease: "power1.out" }, 0);
  tl.to(channelEl, { x: 0, y: 0, scale: 1, duration: 0.45, ease: "expo.out" }, 0);
  tl.to(others, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, 0.15);
}
