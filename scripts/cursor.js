// Wii-style hand cursor with a subtle trailing after-image.
// Main hand: 1:1 with the mouse.
// Trail: per-frame lerp toward the latest cursor position — visibly trails on
// fast moves but always catches up, so it can never "stall" behind a flick.

function mountSprite({ srcIdle, srcClicked, opacity, zIndex }) {
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
    transition: opacity 150ms ease-out;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
    will-change: transform;
  `;
  document.body.appendChild(img);
  return img;
}

export function installCursor() {
  // Only install on devices with a fine pointer (skip touch devices).
  if (!window.matchMedia("(pointer: fine)").matches) return;

  // Note: the actual `cursor: none` rule lives in styles/main.css so it's
  // applied immediately on page load (before this module runs) and survives
  // bfcache restores from browser swipe-back gestures.

  const trail = mountSprite({
    srcIdle: "assets/trail.svg",
    srcClicked: "assets/trail.svg",
    opacity: 0.4,
    zIndex: 999,
  });
  const main = mountSprite({
    srcIdle: "assets/cursor.svg",
    srcClicked: "assets/cursor-clicked.svg",
    opacity: 1,
    zIndex: 1000,
  });

  // Latest mouse position (target) + current trail position (eased toward target).
  let targetX = 0, targetY = 0;
  let trailX = 0, trailY = 0;
  let clicked = false;
  let visible = false;
  let primed = false;

  // 0..1 — fraction of the remaining gap the trail closes each frame.
  // Higher = snappier (less lag). 0.22 ≈ catches up in ~6 frames.
  const TRAIL_EASE = 0.22;

  const onMove = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!primed) {
      // First sighting — snap trail to the cursor so it doesn't fly in from 0,0.
      trailX = targetX;
      trailY = targetY;
      primed = true;
    }
    if (!visible) {
      main.style.opacity = "1";
      trail.style.opacity = "0.4";
      visible = true;
    }
    main.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)${clicked ? " scale(0.95)" : ""}`;
  };

  const onLeave = () => {
    main.style.opacity = "0";
    trail.style.opacity = "0";
    visible = false;
  };
  const onDown = () => {
    clicked = true;
    main.src = "assets/cursor-clicked.svg";
    main.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(0.95)`;
  };
  const onUp = () => {
    clicked = false;
    main.src = "assets/cursor.svg";
    main.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseleave", onLeave);
  document.addEventListener("mousedown", onDown);
  document.addEventListener("mouseup", onUp);

  // rAF loop: lerp the trail toward the target every frame so it can never get
  // permanently left behind, regardless of how fast the cursor moves.
  const tick = () => {
    trailX += (targetX - trailX) * TRAIL_EASE;
    trailY += (targetY - trailY) * TRAIL_EASE;
    trail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
