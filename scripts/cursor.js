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

function mountPointer({ srcIdle, srcClicked, opacity, throttleMs, zIndex, smooth }) {
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
    opacity: 0;
    z-index: ${zIndex};
    ${smooth ? "transition: transform 70ms ease-out, opacity 150ms ease-out;" : "transition: opacity 150ms ease-out;"}
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
    will-change: transform;
  `;
  document.body.appendChild(img);

  let clicked = false;
  let visible = false;
  let x = 0, y = 0;

  const setTransform = () => {
    img.style.transform = `translate3d(${x}px, ${y}px, 0)${clicked ? " scale(0.95)" : ""}`;
  };

  const baseMove = (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!visible) {
      img.style.opacity = String(opacity);
      visible = true;
    }
    setTransform();
  };

  const move = throttleMs > 0 ? throttle(baseMove, throttleMs) : baseMove;

  const leave = () => { img.style.opacity = "0"; visible = false; };
  const down = () => { clicked = true; img.src = srcClicked; setTransform(); };
  const up = () => { clicked = false; img.src = srcIdle; setTransform(); };

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseleave", leave);
  document.addEventListener("mousedown", down);
  document.addEventListener("mouseup", up);
}

export function installCursor() {
  // Only install on devices with a fine pointer (skip touch devices).
  if (!window.matchMedia("(pointer: fine)").matches) return;

  // Hide the native cursor on every element, including hover states for
  // buttons and links. `*` + `*:hover` + `*::before/::after` covers text,
  // pseudo-elements, and anything with a UA-default cursor (e.g. `pointer`).
  const style = document.createElement("style");
  style.textContent = `
    *, *::before, *::after { cursor: none !important; }
    *:hover, *:focus, *:active { cursor: none !important; }
  `;
  document.head.appendChild(style);

  // Trail: throttled + eased, so it visibly lags behind.
  mountPointer({
    srcIdle: "assets/trail.svg",
    srcClicked: "assets/trail.svg",
    opacity: 0.4,
    throttleMs: 16,
    zIndex: 999,
    smooth: true,
  });
  // Main hand: zero throttle, no transition, 1:1 with mouse.
  mountPointer({
    srcIdle: "assets/cursor.svg",
    srcClicked: "assets/cursor-clicked.svg",
    opacity: 1,
    throttleMs: 0,
    zIndex: 1000,
    smooth: false,
  });
}
