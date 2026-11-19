export function initHero(config) {
  const section = document.querySelector("#hero");
  if (!section) return;
  section.hidden = !config.hero.visible;
  const couplePhoto = section.querySelector('[data-field="hero-couple-photo"]');
  if (couplePhoto) {
    const photo = config.hero.moonlightPhoto;
    couplePhoto.hidden = !photo?.visible || !photo.src;
    couplePhoto.onerror = () => { couplePhoto.hidden = true; };
    couplePhoto.alt = photo?.alt || "신랑 신부의 웨딩 사진";
    if (couplePhoto.hidden) couplePhoto.removeAttribute("src");
    else couplePhoto.src = photo.src;
  }
  const title = section.querySelector("h1");
  const titleText = document.createElement("span");
  titleText.className = "hero-title-text";
  titleText.textContent = config.hero.title;
  title.hidden = !config.hero.title;
  title.replaceChildren(titleText);
  const titleImage = config.hero.titleImage;
  if (titleImage?.visible && titleImage.src) {
    const image = document.createElement("img");
    image.className = "hero-title-image";
    image.alt = titleImage.alt || config.hero.title;
    image.decoding = "async";
    image.onerror = () => {
      title.replaceChildren(titleText);
      title.hidden = !config.hero.title;
    };
    image.src = titleImage.src;
    title.hidden = false;
    title.replaceChildren(image);
  }
  const subtitle = section.querySelector(".eyebrow");
  const subtitleText = document.createElement("span");
  subtitleText.className = "hero-subtitle-text";
  subtitleText.textContent = config.hero.subtitle;
  const subtitleVisual = document.createElement("span");
  subtitleVisual.setAttribute("aria-hidden", "true");
  let characterIndex = 0;
  for (const word of config.hero.subtitle.split(/(\s+)/)) {
    if (/^\s+$/.test(word)) { subtitleVisual.append(document.createTextNode(word)); continue; }
    const wordNode = document.createElement("span");
    wordNode.className = "hero-subtitle-word";
    for (const character of Array.from(word)) {
      const letter = document.createElement("span");
      letter.className = "hero-subtitle-letter";
      letter.textContent = character;
      letter.style.setProperty("--letter-delay", `${Math.min(characterIndex++ * 85, 5000)}ms`);
      wordNode.append(letter);
    }
    subtitleVisual.append(wordNode);
  }
  subtitle.replaceChildren(subtitleText, subtitleVisual);
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
  date.textContent = config.basic.weddingDate.replaceAll("-", ".");
  date.dateTime = config.basic.weddingDate;
  const venue = section.querySelector('[data-field="venue"]');
  venue.textContent = config.weddingInfo.venue ? `- ${config.weddingInfo.venue} -` : "";
  venue.hidden = !config.weddingInfo.venue;
  const img = section.querySelector('[data-field="hero-image"]');
  const media = section.querySelector('[data-hero-media]');
  img.hidden = !config.hero.image.visible || !config.hero.image.src;
  media.hidden = img.hidden;
  img.onerror = () => { img.hidden = true; media.hidden = true; };
  if (!img.hidden) {
    img.src = config.hero.image.src;
    img.alt = config.hero.image.alt;
  } else {
    img.removeAttribute("src");
    img.alt = "";
  }
}
