import assert from "node:assert/strict";
import { initSectionMotion } from "../js/core/section-motion.js";

class Node {
  nodeType = 1; children = []; parentElement = null; hidden = false; status = false;
  classes = new Set(); props = new Map();
  constructor(tag, classes = []) { this.tag = tag; classes.forEach(c => this.classes.add(c)); }
  classList = { contains: c => this.classes.has(c), add: c => this.classes.add(c), remove: c => this.classes.delete(c) };
  style = { setProperty: (k, v) => this.props.set(k, v) };
  append(node) { node.parentElement = this; this.children.push(node); }
  matches(selector) {
    return selector.split(",").some(part => {
      part = part.trim();
      if (part === '[role="status"]' || part === '[aria-live]') return this.status;
      if (part === "[hidden]") return this.hidden;
      if (part.startsWith(".") && !part.includes(" ")) return part.slice(1).split(".").every(c => this.classes.has(c));
      return part === this.tag;
    });
  }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  querySelectorAll(selector) { return this.children.flatMap(n => [...(n.matches(selector) ? [n] : []), ...n.querySelectorAll(selector)]); }
  contains(node) { return node === this || this.children.some(n => n.contains(node)); }
}
const root = new Node("main"), section = new Node("section", ["section"]), panel = new Node("div", ["section-inner", "section-fade-up"]);
root.append(section); section.append(panel);
const title = new Node("h2"), subtitle = new Node("p", ["eyebrow"]), message = new Node("p"), hidden = new Node("p"), status = new Node("p");
hidden.hidden = true; status.status = true;
for (const n of [title, subtitle, message, hidden, status]) panel.append(n);
const photo = new Node("div", ["family-photo"]), caption = new Node("p"); photo.append(caption); panel.append(photo);
const observers = [], mutations = [];
globalThis.IntersectionObserver = class {
  targets = new Set(); disconnected = false;
  constructor(callback) { this.callback = callback; observers.push(this); }
  observe(node) { this.targets.add(node); }
  unobserve(node) { this.targets.delete(node); }
  disconnect() { this.disconnected = true; this.targets.clear(); }
};
globalThis.MutationObserver = class {
  constructor(callback) { this.callback = callback; mutations.push(this); }
  observe() {} disconnect() { this.disconnected = true; }
};
globalThis.document = { querySelector: () => root };
try {
  initSectionMotion();
  const io = observers[0];
  assert(!panel.classes.has("section-fade-up"));
  assert.deepEqual([...io.targets], [title, subtitle, message, photo]);
  io.callback([{ target: title, isIntersecting: false }], io);
  assert(!title.classes.has("section-fade-up"));
  io.callback([title, subtitle].map(target => ({ target, isIntersecting: true })), io);
  assert(title.classes.has("section-fade-up"));
  assert.equal(subtitle.props.get("--reveal-delay"), "60ms");
  assert(!io.targets.has(title));
  const late = new Node("p"); panel.append(late);
  mutations[0].callback([{ type: "childList", addedNodes: [late] }]);
  assert(io.targets.has(late));
  mutations[0].callback([{ type: "childList", addedNodes: [{ nodeType: 3 }] }]);
  assert(!io.targets.has(title)); // Text refresh must not replay already shown content.
  hidden.hidden = false;
  mutations[0].callback([{ type: "attributes", target: hidden }]);
  assert(io.targets.has(hidden));
  panel.children = panel.children.filter(n => n !== late);
  mutations[0].callback([{ type: "childList", addedNodes: [] }]);
  assert(!io.targets.has(late));
  initSectionMotion();
  assert(io.disconnected && mutations[0].disconnected);
  assert(!observers[1].targets.has(title));
  assert(observers[1].targets.has(message));
  delete globalThis.IntersectionObserver;
  initSectionMotion();
  assert(!message.classes.has("motion-item")); // Safe visible fallback.
} finally {
  delete globalThis.document; delete globalThis.IntersectionObserver; delete globalThis.MutationObserver;
}
console.log("PASS: individual reveal targets, stagger, hidden/dynamic content, live feedback exclusion and observer cleanup");
