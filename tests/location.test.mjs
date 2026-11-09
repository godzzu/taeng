import assert from "node:assert/strict";
import { getWeddingConfig } from "../js/core/config.js";
import { getMapLinks, initMapService } from "../js/services/map.js";
import { initLocation } from "../js/sections/location.js";

class Node {
  nodes = new Map(); children = []; attributes = {}; handlers = [];
  textContent = ""; hidden = false;
  querySelector(key) { if (!this.nodes.has(key)) this.nodes.set(key, new Node()); return this.nodes.get(key); }
  setAttribute(key, value) { this.attributes[key] = value; }
  replaceChildren(...nodes) { this.children = nodes; }
  append(node) { this.children.push(node); }
  addEventListener(name, fn, options) { this.handlers.push({ name, fn, signal: options?.signal }); }
  async click() { for (const h of this.handlers) if (h.name === "click" && !h.signal?.aborted) await h.fn(); }
}
const config = getWeddingConfig();
config.location.links = [
  { provider: "kakao", label: "카카오맵 길찾기", url: "" },
  { provider: "naver", label: "네이버 지도 길찾기", url: "" }
];
config.location.coordinates = { latitude: 37.5, longitude: 127.1 };
config.weddingInfo.venue = "꽃 & 마음 / 웨딩";
config.weddingInfo.address = "서울 테스트로 1\n2층";
let links = getMapLinks(config);
assert.equal(links[0].url, "https://map.kakao.com/link/to/" + encodeURIComponent(config.weddingInfo.venue) + ",37.5,127.1");
assert.match(links[1].url, /map.naver.com\/p\/search\//);
config.location.links[1].url = "https://naver.me/example";
assert.equal(getMapLinks(config)[1].url, "https://naver.me/example");
config.location.links[1].url = "https://map.naver.com/v5/search/wedding";
assert.equal(getMapLinks(config)[1].label, config.labels.naverSearch);
config.location.links[0].url = "https://map.kakao.com/link/map/123";
assert.equal(getMapLinks(config)[0].label, config.labels.kakaoSearch);
assert.equal(getMapLinks(config)[0].url, config.location.links[0].url);
config.location.links[0].url = "";
const container = new Node(), status = new Node();
let calls = 0;
let service = initMapService({ config, container, status }, () => { calls++; });
assert.equal(await service.ready, "no-key"); assert.equal(calls, 0); assert(container.hidden);
service.destroy();
config.location.coordinates = null;
service = initMapService({ config, container, status, appConfig: { kakaoMapJavascriptKey: "test" } }, () => { calls++; });
assert.equal(await service.ready, "no-coordinates"); assert.equal(calls, 0);
assert.equal(getMapLinks(config)[0].label, config.labels.kakaoSearch);
service.destroy();
config.location.coordinates = { latitude: 37.5, longitude: 127.1 };
service = initMapService({ config, container, status, appConfig: { kakaoMapJavascriptKey: "test" } }, async () => { throw Error("offline"); });
assert.equal(await service.ready, "error"); assert.equal(status.textContent, config.labels.mapUnavailable);
service.destroy();
let tiles, markerRemoved = false, observedCenter;
const sdk = {
  LatLng: class { constructor(lat, lng) { this.lat = lat; this.lng = lng; } },
  Map: class { constructor(node, options) { observedCenter = options.center; } },
  Marker: class { setMap(value) { markerRemoved = value === null; } },
  event: { addListener(map, name, fn) { tiles = fn; }, removeListener() {} }
};
service = initMapService({ config, container, status, appConfig: { kakaoMapJavascriptKey: "test" } }, async () => sdk);
assert.equal(await service.ready, "ready"); assert.equal(observedCenter.lat, 37.5); assert(!container.hidden);
tiles(); assert(status.hidden);
service.destroy(); assert(markerRemoved); assert(container.hidden);
let finish;
service = initMapService({ config, container, status, appConfig: { kakaoMapJavascriptKey: "test" } }, () => new Promise(resolve => { finish = resolve; }));
service.destroy(); finish(sdk);
assert.equal(await service.ready, "disposed"); assert(container.hidden);

const section = new Node();
globalThis.document = { querySelector: () => section, createElement: () => new Node() };
let copied, writes = 0;
Object.defineProperty(globalThis, "navigator", { configurable: true, value: {
  clipboard: { async writeText(value) { copied = value; writes++; } }
} });
for (const theme of ["wedding-floral", "wedding-sketch"]) {
  config.templateId = theme;
  initLocation(config);
  const copy = section.querySelector("[data-copy-address]");
  await copy.click();
  assert.equal(copied, config.weddingInfo.address);
  assert.equal(section.querySelector("[data-address-status]").textContent, config.labels.addressCopied);
  assert.equal(copy.disabled, false);
  for (const link of section.querySelector('[data-field="map-links"]').children) {
    assert.equal(link.target, "_blank"); assert.equal(link.rel, "noopener noreferrer");
  }
}
assert.equal(writes, 2); // Reinitialization must not duplicate clipboard handlers.
navigator.clipboard.writeText = async () => { throw Error("denied"); };
await section.querySelector("[data-copy-address]").click();
assert.equal(section.querySelector("[data-address-status]").textContent, config.labels.addressCopyFailed);
config.weddingInfo.address = "";
initLocation(config);
assert(section.querySelector("[data-copy-address]").hidden);
console.log("PASS: destination links, missing key/coordinates, SDK failure/success/cleanup, late response, clipboard and both themes.");
