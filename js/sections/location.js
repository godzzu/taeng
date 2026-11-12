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
  for (const key of ["car", "transport", "subway", "parking"]) {
    const item = config.location[key];
    const node = section.querySelector(`[data-travel="${key}"]`);
    node.querySelector("h3").textContent = item.title;
    node.querySelector("p").textContent = item.text;
    node.hidden = !item.visible || !item.text;
  }
  const copy = section.querySelector("[data-copy-address]");
  const feedback = section.querySelector("[data-address-status]");
  copy.setAttribute("aria-label", config.labels.copyAddress || "주소 복사");
  copy.title = config.labels.copyAddress || "주소 복사";
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
  const mapBrands = {
    kakao: { name: "카카오맵", image: "./assets/images/logo/kakao_map.png" },
    naver: { name: "네이버지도", image: "./assets/images/logo/naver_map.png" }
  };
  getMapLinks(config).forEach(({ provider, label, url }) => {
    const brand = mapBrands[provider];
    const name = brand?.name || label;
    const anchor = document.createElement("a");
    anchor.className = "button button-small map-link";
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    if (brand) {
      const logo = document.createElement("img");
      logo.src = brand.image;
      logo.alt = "";
      logo.width = logo.height = 24;
      logo.decoding = "async";
      logo.onerror = () => { logo.hidden = true; };
      anchor.append(logo);
    }
    const text = document.createElement("span");
    text.textContent = name;
    anchor.append(text);
    anchor.setAttribute("aria-label", `${name} (${config.labels.mapNewWindow})`);
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
