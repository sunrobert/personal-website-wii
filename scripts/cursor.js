// Wii-style hand cursor with a subtle trailing after-image.
// Pattern borrowed from bvvst/lukedotboo.

function throttle(fn, delay) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last < delay) return;
    last = now;
    return fn(...args);
  };
}

function mountPointer(srcIdle, srcClicked, opacity, throttleMs, zIndex) {
  const img = document.createElement("img");
  img.src = srcIdle;
  img.alt = "";
  img.decoding = "async";
  img.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 28px;
    height: auto;
    pointer-events: none;
    user-select: none;
    transform: translate3d(-9999px, -9999px, 0);
    opacity: ${opacity};
    z-index: ${zIndex};
    transition: transform 80ms linear, opacity 150ms ease-out;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
    will-change: transform;
  `;
  document.body.appendChild(img);

  let rafId = 0;
  let visible = false;

  const move = throttle((e) => {
    if (rafId) cancelAnimationFrame(rafId);
    if (!visible) {
      img.style.opacity = String(opacity);
      visible = true;
    }
    rafId = requestAnimationFrame(() => {
      img.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    });
  }, throttleMs);

  const enter = () => { img.style.opacity = String(opacity); visible = true; };
  const leave = () => { img.style.opacity = "0"; visible = false; };
  const down = () => { img.src = srcClicked; img.style.transform += " scale(0.95)"; };
  const up = () => { img.src = srcIdle; };

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseenter", enter);
  document.addEventListener("mouseleave", leave);
  document.addEventListener("mousedown", down);
  document.addEventListener("mouseup", up);
}

export function installCursor() {
  // Only install on devices with a fine pointer (skip touch devices).
  if (!window.matchMedia("(pointer: fine)").matches) return;

  // Hide native cursor everywhere inside the menu.
  const style = document.createElement("style");
  style.textContent = `
    html, body, #stage, .channel, .bb-btn, .wii-menu-btn, a, button, .mute-btn {
      cursor: none !important;
    }
  `;
  document.head.appendChild(style);

  // Trail first (lower z, slightly laggy), then the main hand pointer.
  mountPointer("assets/trail.svg", "assets/trail.svg", 0.4, 8, 999);
  mountPointer("assets/cursor.svg", "assets/cursor-clicked.svg", 1, 0, 1000);
}
