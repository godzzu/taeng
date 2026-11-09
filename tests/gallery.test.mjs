import assert from "node:assert/strict";
import { initGallery } from "../js/sections/gallery.js";
import { getWeddingConfig } from "../js/core/config.js";
class Style {
  values = new Map();
  getPropertyValue(key) { return this.values.get(key)?.[0] || ""; }
  getPropertyPriority(key) { return this.values.get(key)?.[1] || ""; }
  setProperty(key, value, priority = "") { this.values.set(key, [value, priority]); }
  removeProperty(key) { this.values.delete(key); }
}
class Node {
  children = []; nodes = new Map(); handlers = new Map(); attributes = {}; style = new Style(); hidden = false;
  textContent = ""; open = false;
  querySelector(key) { if (!this.nodes.has(key)) this.nodes.set(key, new Node()); return this.nodes.get(key); }
  setAttribute(key, value) { this.attributes[key] = value; }
  append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  replaceWith(node) { const parent = this.parent; parent.children[parent.children.indexOf(this)] = node; node.parent = parent; }
  addEventListener(name, handler, options) {
    const entry = { handler, signal: options?.signal };
    if (!this.handlers.has(name)) this.handlers.set(name, []);
    this.handlers.get(name).push(entry);
  }
  fire(name, values = {}) {
    const event = { target: this, preventDefault() {}, ...values };
    for (const { handler, signal } of this.handlers.get(name) || []) if (!signal?.aborted) handler(event);
  }
  focus() { document.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; this.fire("close"); }
}
const section = new Node(), dialog = new Node(), root = new Node(), body = new Node();
root.clientWidth = 380;
const stage = dialog.querySelector("[data-dialog-stage]");
const image = dialog.querySelector("[data-dialog-image]");
stage.append(image);
// Query the current dynamic image node after reinitialization.
const originalQuery = dialog.querySelector.bind(dialog);
dialog.querySelector = key => key === "[data-dialog-image]" ? stage.children[0] : originalQuery(key);
globalThis.document = { documentElement: root, body, activeElement: null,
  querySelector: selector => selector === "#gallery" ? section : dialog, createElement: () => new Node() };
globalThis.window = { scrollX: 0, scrollY: 640, innerWidth: 400, scrollTo(x, y) { this.restored = [x, y]; } };
globalThis.getComputedStyle = () => ({ paddingRight: "8px" });
body.style.setProperty("position", "relative", "important");
root.style.setProperty("overflow", "clip");
root.style.setProperty("scroll-behavior", "smooth");
const grid = section.querySelector('[data-field="gallery"]');
const counter = dialog.querySelector("[data-dialog-counter]");
const status = dialog.querySelector("[data-dialog-status]");
const retry = dialog.querySelector("[data-dialog-retry]");
const next = dialog.querySelector("[data-dialog-next]");
const prev = dialog.querySelector("[data-dialog-prev]");
const close = dialog.querySelector("[data-dialog-close]");
for (const templateId of ["wedding-floral", "wedding-sketch"]) {
  const config = getWeddingConfig(); config.templateId = templateId;
  initGallery(config);
  assert.equal(grid.children.length, config.gallery.items.length);
  // Use a fixed three-image fixture for navigation and wrap-around assertions.
  config.gallery.items = config.gallery.items.slice(0, 3);
  initGallery(config);
  assert.equal(grid.children.length, 3);
  const thumb = grid.children[1];
  assert.equal(thumb.children[0].loading, "lazy");
  thumb.children[0].fire("error");
  assert(thumb.children[0].hidden);
  assert(!thumb.children[1].hidden);
  thumb.fire("click");
  assert(dialog.open);
  assert.equal(document.activeElement, close);
  assert.equal(body.style.getPropertyValue("position"), "fixed");
  assert.equal(counter.textContent, "2 / 3");
  const oldImage = stage.children[0];
  next.fire("click");
  assert.equal(counter.textContent, "3 / 3");
  oldImage.onerror();
  assert.equal(status.textContent, config.labels.galleryLoading);
  stage.children[0].onerror();
  assert(!retry.hidden);
  assert.equal(status.textContent, config.labels.galleryError);
  retry.focus(); retry.fire("click");
  assert.equal(document.activeElement, close);
  stage.children[0].onload();
  assert(!stage.children[0].hidden);
  assert.equal(status.textContent, "");
  next.fire("click"); assert.equal(counter.textContent, "1 / 3");
  dialog.fire("keydown", { key: "ArrowLeft" }); assert.equal(counter.textContent, "3 / 3");
  const swipe = (x, y) => {
    stage.fire("touchstart", { touches: [{ identifier: 1, clientX: 150, clientY: 100 }] });
    stage.fire("touchend", { touches: [], changedTouches: [{ identifier: 1, clientX: x, clientY: y }] });
  };
  swipe(140, 250); assert.equal(counter.textContent, "3 / 3");
  swipe(50, 105); assert.equal(counter.textContent, "1 / 3");
  stage.fire("touchstart", { touches: [{ identifier: 1, clientX: 150, clientY: 100 }] });
  stage.fire("touchmove", { touches: [{}, {}] });
  stage.fire("touchend", { touches: [], changedTouches: [{ identifier: 1, clientX: 50, clientY: 100 }] });
  assert.equal(counter.textContent, "1 / 3");
  dialog.fire("cancel");
  assert(!dialog.open);
  assert.equal(body.style.getPropertyValue("position"), "relative");
  assert.equal(body.style.getPropertyPriority("position"), "important");
  assert.equal(root.style.getPropertyValue("overflow"), "clip");
  assert.equal(root.style.getPropertyValue("scroll-behavior"), "smooth");
  assert.equal(body.style.getPropertyValue("top"), "");
  assert.equal(document.activeElement, thumb);
  assert.deepEqual(window.restored, [0, 640]);
  thumb.fire("click");
  dialog.fire("pointerdown", { target: stage }); dialog.fire("click");
  assert(dialog.open); // Drag from image to background must not dismiss.
  dialog.fire("pointerdown"); dialog.fire("click"); assert(!dialog.open);
  thumb.fire("click");
  initGallery(config); assert(!dialog.open);
  grid.children[0].fire("click");
  next.fire("click"); assert.equal(counter.textContent, "2 / 3"); // No duplicate handlers.
  close.fire("click");
}
const config = getWeddingConfig(); config.gallery.items = config.gallery.items.slice(0, 1);
initGallery(config);
assert(prev.hidden && next.hidden);
grid.children[0].fire("click");
dialog.fire("keydown", { key: "ArrowRight" });
assert.equal(counter.textContent, "1 / 1");
close.fire("click");
config.gallery.items = [];
initGallery(config);
assert(section.hidden);
assert.equal(grid.children.length, 0);
console.log("PASS: gallery rendering, lazy loading, error/retry and stale loads, keyboard, swipes, scroll/focus restoration, reinitialization, 0/1 images and both template configs.");
