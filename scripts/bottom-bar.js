export function renderBottomBar(container) {
  container.innerHTML = `
    <svg class="swoosh" viewBox="0 0 1280 100" preserveAspectRatio="none" aria-hidden="true">
      <path class="swoosh-path"
            d="M0,55 Q200,10 400,40 T800,45 T1280,30 L1280,100 L0,100 Z"
            fill="#bfe1ff" opacity="0.7"/>
      <path class="swoosh-line"
            d="M0,55 Q200,10 400,40 T800,45 T1280,30"
            fill="none" stroke="#6fb6ff" stroke-width="2" opacity="0.9"/>
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
  const envelope = document.querySelector(".bb-btn--envelope");
  envelope?.addEventListener("click", async () => {
    const { playSelect } = await import("./audio.js");
    playSelect();
    const flash = document.getElementById("flash-overlay");
    gsap.to(flash, {
      opacity: 1,
      duration: 0.2,
      onComplete: () => { window.location.href = "messages.html"; },
    });
  });
}
