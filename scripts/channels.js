export const CHANNELS = [
  { slot: 0, id: "photography", title: "Photography",      href: "photography.html", art: "assets/channels/photography.png" },
  { slot: 1, id: "social",      title: "Social Links",     href: "social.html",      art: "assets/channels/social.png" },
  { slot: 2, id: "writings",    title: "My Writings",      href: "writings.html",    art: "assets/channels/writings.png" },
  { slot: 3, id: "favorites",   title: "Favorites",        href: "favorites.html",   art: "assets/channels/favorites.png" },
  { slot: 4, id: "playground",  title: "Playground",       href: "playground.html",  art: "assets/channels/playground.png" },
];

export function renderGrid(container) {
  container.innerHTML = "";
  for (let slot = 0; slot < 12; slot++) {
    const channel = CHANNELS.find((c) => c.slot === slot);
    const el = document.createElement(channel ? "button" : "div");
    el.className = channel ? "channel channel--active" : "channel channel--empty";
    el.dataset.slot = String(slot);
    if (channel) {
      el.dataset.channelId = channel.id;
      el.dataset.href = channel.href;
      el.setAttribute("aria-label", channel.title);
      el.innerHTML = `
        <img class="channel__art" src="${channel.art}" alt="" />
        <span class="channel__title">${channel.title}</span>
      `;
    } else {
      el.innerHTML = `<span class="channel__watermark">Wii</span>`;
    }
    container.appendChild(el);
  }
}
