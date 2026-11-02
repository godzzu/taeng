// 설정을 화면에 연결하는 계층. config.js는 DOM에 의존하지 않습니다.
export function renderConfig(config) {
  const ids = { hero: "hero", invitation: "invitation", weddingInfo: "wedding-info", gallery: "gallery", location: "location", account: "account", contact: "contact", guestbook: "guestbook" };
  for (const [key, id] of Object.entries(ids)) {
    const section = document.getElementById(id);
    const data = config[key];
    section.hidden = !data.visible;
    const title = section.querySelector("h1, h2");
    if (title) title.textContent = data.title;
    const subtitle = section.querySelector(".eyebrow");
    if (subtitle) { subtitle.textContent = data.subtitle; subtitle.hidden = !data.subtitle; }
    const description = section.querySelector(".section-description");
    if (description) { description.textContent = data.description; description.hidden = !data.description; }
    document.querySelectorAll(`a[href="#${id}"]`).forEach(link => { link.hidden = !data.visible; });
  }
  document.querySelectorAll("[data-copy]").forEach(node => { node.textContent = config.labels[node.dataset.copy]; });
  document.querySelectorAll("[data-placeholder]").forEach(node => { node.placeholder = config.labels[node.dataset.placeholder]; });
  document.querySelectorAll("[data-aria]").forEach(node => { node.setAttribute("aria-label", config.labels[node.dataset.aria]); });
  const footer = document.querySelector(".site-footer");
  footer.hidden = !config.footer.visible;
  footer.querySelector('[data-field="footer-names"]').textContent = `${config.basic.groomName} ♥ ${config.basic.brideName}`;
  footer.querySelector('[data-field="footer-message"]').textContent = config.footer.message;
  document.querySelector("[data-share-button]").hidden = !config.share.visible;
  document.title = config.share.title;
  const metadata = { description: config.share.description, "og:title": config.share.title, "og:description": config.share.description, "og:type": "website", "og:url": config.share.url || window.location.href };
  if (config.share.image.visible && config.share.image.src) {
    metadata["og:image"] = new URL(config.share.image.src, document.baseURI).href;
    metadata["og:image:alt"] = config.share.image.alt;
  }
  for (const [key, value] of Object.entries(metadata)) {
    const attribute = key.startsWith("og:") ? "property" : "name";
    let meta = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute(attribute, key); document.head.append(meta); }
    meta.content = value;
  }
}
