import { getMapLinks, initMapService } from "../services/map.js";
import { copyText } from "../services/clipboard.js";

let disposeLocation;
export function initLocation(config, appConfig = {}) {
  disposeLocation?.();
  const section = document.querySelector("#location");
  if (!section) return;
  let active = true;
  const events = new AbortController();
  section.hidden = !config.location.visible;
  section.querySelector("h2").textContent = config.location.title;
  const subtitle = section.querySelector(".eyebrow");
  subtitle.textContent = config.location.subtitle;
  subtitle.hidden = !config.location.subtitle;
  const address = section.querySelector('[data-field="location-address"]');
  section.querySelector('[data-field="location-venue"]').textContent = config.weddingInfo.venue;
  address.textContent = config.weddingInfo.address;
  address.hidden = !config.weddingInfo.address;
  for (const key of ["transport", "parking"]) {
    const node = section.querySelector(`[data-field="${key}"]`);
    node.textContent = config.location[key].text;
    node.hidden = !config.location[key].visible || !config.location[key].text;
  }
  const copy = section.querySelector("[data-copy-address]");
  const feedback = section.querySelector("[data-address-status]");
  copy.textContent = config.labels.copyAddress;
  copy.hidden = !config.weddingInfo.address;
  copy.disabled = false;
  feedback.textContent = "";
  copy.addEventListener("click", async () => {
    copy.disabled = true;
    try {
      await copyText(config.weddingInfo.address);
      if (active) feedback.textContent = config.labels.addressCopied;
    } catch {
      if (active) feedback.textContent = config.labels.addressCopyFailed;
    } finally { if (active) copy.disabled = false; }
  }, { signal: events.signal });
  const links = section.querySelector('[data-field="map-links"]');
  links.replaceChildren();
  getMapLinks(config).forEach(({ label, url }) => {
    const anchor = document.createElement("a");
    anchor.className = "button button-primary";
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = label;
    anchor.setAttribute("aria-label", `${label} (${config.labels.mapNewWindow})`);
    links.append(anchor);
  });
  links.hidden = !links.children.length;
  const service = initMapService({
    config, appConfig,
    container: section.querySelector("[data-location-map]"),
    status: section.querySelector("[data-map-status]")
  });
  disposeLocation = () => { active = false; events.abort(); service.destroy(); };
}
