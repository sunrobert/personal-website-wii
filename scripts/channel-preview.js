import { playSelect, playHover, playBack } from "./audio.js?v=1786300000";

export function showChannelPreview(channel) {
  const overlay = document.createElement("div");
  overlay.id = "channel-preview";
  overlay.innerHTML = `
    <div class="cp-stage">
      <div class="cp-banner">
        <img class="cp-art" src="${channel.art}" alt="" />
        <h1 class="cp-title">${channel.title}</h1>
      </div>
    </div>
    <div class="cp-footer">
      <button type="button" class="cp-btn cp-btn--menu">Menu</button>
      <button type="button" class="cp-btn cp-btn--start">Start</button>
    </div>
    <div id="cp-flash"></div>
  `;
  document.body.appendChild(overlay);

  const menuBtn = overlay.querySelector(".cp-btn--menu");
  const startBtn = overlay.querySelector(".cp-btn--start");
  const flash = overlay.querySelector("#cp-flash");

  for (const btn of [menuBtn, startBtn]) {
    btn.addEventListener("pointerenter", playHover);
    btn.addEventListener("focus", playHover);
  }

  menuBtn.addEventListener("click", () => {
    (playBack || playSelect)();
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.25,
      ease: "power1.out",
      onComplete: () => overlay.remove(),
    });
  });

  startBtn.addEventListener("click", () => {
    playSelect();
    gsap.to(flash, {
      opacity: 1,
      duration: 0.18,
      ease: "power1.out",
      onComplete: () => {
        window.location.href = `${channel.href}?from=${encodeURIComponent(channel.id)}`;
      },
    });
  });

  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") menuBtn.click();
    if (e.key === "ArrowLeft") menuBtn.focus();
    if (e.key === "ArrowRight") startBtn.focus();
  });

  // Enter: fast fade + a subtle settle on the banner stage (skipped under
  // reduced motion — the fade alone carries comprehension).
  gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "expo.out" });
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const stage = overlay.querySelector(".cp-stage");
    gsap.fromTo(stage, { scale: 0.985 }, { scale: 1, duration: 0.25, ease: "expo.out" });
  }
  requestAnimationFrame(() => startBtn.focus());
}
