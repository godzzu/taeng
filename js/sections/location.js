export function initLocation(config) {
  const section = document.querySelector("#location");
  if (!section) return;
  section.querySelector('[data-field="location-venue"]').textContent = config.weddingInfo.venue;
  section.querySelector('[data-field="location-address"]').textContent = config.weddingInfo.address;
  for (const key of ["transport", "parking"]) {
    const node = section.querySelector(`[data-field="${key}"]`);
    node.textContent = config.location[key].text;
    node.hidden = !config.location[key].visible || !config.location[key].text;
  }
  const links = section.querySelector('[data-field="map-links"]');
  links.replaceChildren();
  config.location.links.forEach(({ label, url }) => {
    const anchor = document.createElement("a");
    anchor.className = "button button-primary";
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = label;
    links.append(anchor);
  });
}
