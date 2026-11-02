export function initLocation(config) {
  const section = document.querySelector("#location");
  if (!section) return;
  const location = config.location;
  section.querySelector('[data-field="location-venue"]').textContent = location.venue;
  section.querySelector('[data-field="location-address"]').textContent = location.address;
  section.querySelector('[data-field="transport"]').textContent = location.transport;
  section.querySelector('[data-field="parking"]').textContent = location.parking;
  const links = section.querySelector('[data-field="map-links"]');
  links.replaceChildren();
  [
    ["카카오맵에서 보기", location.kakaoMapUrl],
    ["네이버 지도에서 보기", location.naverMapUrl]
  ].forEach(([label, url]) => {
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.className = "button button-primary";
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = label;
    links.append(anchor);
  });
}
