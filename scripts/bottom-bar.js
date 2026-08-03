export function renderBottomBar(container) {
  container.innerHTML = `
    <svg class="swoosh" viewBox="0 0 1280 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="swoosh-fill-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e6e8ec" stop-opacity="0.95"/>
          <stop offset="55%" stop-color="#c9ccd2" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#b9bcc2" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <path class="swoosh-fill"
            d="M-60,55 Q200,10 400,40 T800,45 T1340,30 L1340,100 L-60,100 Z"
            fill="url(#swoosh-fill-grad)"/>
      <path class="swoosh-glow"
            d="M-60,55 Q200,10 400,40 T800,45 T1340,30"
            fill="none" stroke="#6fb6ff" stroke-width="8" opacity="0.35"
            filter="blur(1px)"/>
      <path class="swoosh-line"
            d="M-60,55 Q200,10 400,40 T800,45 T1340,30"
            fill="none" stroke="#5fa8e6" stroke-width="2.5" opacity="1"/>
    </svg>
    <button class="bb-btn bb-btn--avatar" aria-label="Profile">
      <img src="assets/avatar.jpg" alt="" />
    </button>
    <div class="clock-box">
      <div class="clock-time" id="clock-time">--:--<span class="ampm">--</span></div>
      <div class="clock-date" id="clock-date">—</div>
    </div>
    <button class="bb-btn bb-btn--envelope" aria-label="Messages">✉</button>
  `;
}

export function installBottomBarNav() {
  const flashTo = async (href) => {
    const { playSelect } = await import("./audio.js?v=1785815000");
    playSelect();
    const flash = document.getElementById("flash-overlay");
    gsap.to(flash, {
      opacity: 1,
      duration: 0.2,
      onComplete: () => { window.location.href = href; },
    });
  };

  document.querySelector(".bb-btn--envelope")?.addEventListener("click", () => flashTo("messages.html"));
  document.querySelector(".bb-btn--avatar")?.addEventListener("click", () => flashTo("about.html"));
}
