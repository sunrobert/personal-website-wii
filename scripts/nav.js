// Moves DOM focus between .channel--active elements using arrow keys.
// Up/Down move by 4 slots (row); Left/Right by 1 (col).
export function installKeyboardNav(container) {
  const buttons = Array.from(container.querySelectorAll(".channel--active"));
  if (buttons.length === 0) return;

  buttons[0].setAttribute("tabindex", "0");
  buttons.slice(1).forEach((b) => b.setAttribute("tabindex", "0"));

  container.addEventListener("keydown", (e) => {
    const current = document.activeElement;
    if (!current || !current.classList.contains("channel--active")) return;
    const slot = parseInt(current.dataset.slot, 10);
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 }[e.key];
    if (delta === undefined) return;
    e.preventDefault();

    for (let next = slot + delta; next >= 0 && next < 12; next += delta) {
      const target = container.querySelector(`.channel--active[data-slot="${next}"]`);
      if (target) { target.focus(); return; }
    }
  });
}
