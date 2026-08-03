const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function formatTime(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return { hhmm: `${h}:${String(m).padStart(2, "0")}`, ampm };
}

export function formatDate(d) {
  return `${DAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
}

export function startClock(timeEl, dateEl) {
  const tick = () => {
    const now = new Date();
    const { hhmm, ampm } = formatTime(now);
    // Colon in its own span so CSS can blink it, Wii-style.
    timeEl.innerHTML = `${hhmm.replace(":", '<span class="colon">:</span>')}<span class="ampm">${ampm}</span>`;
    dateEl.textContent = formatDate(now);
  };
  tick();
  const msToNextMinute = 60_000 - (Date.now() % 60_000);
  setTimeout(() => {
    tick();
    setInterval(tick, 60_000);
  }, msToNextMinute);
}
