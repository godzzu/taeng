export function initHero(config) {
  const section = document.querySelector("#hero");
  if (!section) return;
  section.hidden = !config.hero.visible;
  section.querySelector("h1").textContent = config.hero.title;
  const subtitle = section.querySelector(".eyebrow");
  subtitle.textContent = config.hero.subtitle;
  subtitle.hidden = !config.hero.subtitle;
  const heart = document.createElement("span");
  heart.textContent = "♥";
  heart.setAttribute("aria-hidden", "true");
  heart.className = "hero-heart";
  const names = [config.basic.groomName, config.basic.brideName].map(name => {
    const node = document.createElement("span");
    node.className = "hero-person";
    node.textContent = name;
    return node;
  });
  section.querySelector('[data-field="names"]').replaceChildren(names[0], " ", heart, " ", names[1]);
  const date = section.querySelector('[data-field="date"]');
  date.textContent = `${config.basic.dateLabel}\n${config.basic.timeLabel}`;
  date.dateTime = `${config.basic.weddingDate}T${config.basic.weddingTime}:00+09:00`;
  const scroll = section.querySelector(".hero-scroll");
  scroll.hidden = !config.invitation.visible;
  section.querySelector('[data-field="scroll-label"]').textContent = config.hero.linkLabel;
  scroll.setAttribute("aria-label", config.hero.linkLabel || config.invitation.title);
  const img = section.querySelector('[data-field="hero-image"]');
  img.hidden = !config.hero.image.visible || !config.hero.image.src;
  img.onerror = () => { img.hidden = true; };
  if (!img.hidden) {
    img.src = config.hero.image.src;
    img.alt = config.hero.image.alt;
  } else {
    img.removeAttribute("src");
    img.alt = "";
  }
}
