import assert from "node:assert/strict";
import { getWeddingConfig } from "../js/core/config.js";
import { initInvitation } from "../js/sections/invitation.js";
import { initFamilySlideshow } from "../js/core/family-slideshow.js";

class Node {
  attributes = {};
  setAttribute(key, value) { this.attributes[key] = value; }
  children = []; nodes = new Map(); textContent = "";
  constructor(tag = "div") { this.tagName = tag; }
  querySelector(key) { if (!this.nodes.has(key)) this.nodes.set(key, new Node()); return this.nodes.get(key); }
  append(node) { this.children.push(node); }
  replaceChildren() { this.children = []; }
}
const section = new Node();
globalThis.document = { querySelector: () => section, createElement: tag => new Node(tag) };
try {
  const config = getWeddingConfig();
  const parent = config.invitation.parents[0];
  parent.father = '<img src=x onerror="alert(1)">';
  parent.fatherDeceased = true;
  parent.motherDeceased = false;
  initInvitation(config);
  const families = section.querySelector('[data-field="families"]');
  const names = () => families.children[0].children.find(node => node.className === "family-description").children.find(node => node.className === "family-parents");
  const father = names().children[0];
  assert.equal(families.children[0].children.find(node => node.className === 'family-description').children[1].textContent, '의 ' + parent.relation);
  assert.equal(father.children[0].attributes.role, "img");
  assert.equal(father.children[0].attributes["aria-label"], "고인");
  assert.equal(father.children[0].className, "memorial-flower");
  assert.equal(father.children[1].textContent, parent.father);
  assert.equal(names().children[2].children.length, 1);
  parent.motherDeceased = true;
  initInvitation(config);
  assert.equal(names().children[2].children[0].attributes["aria-label"], "고인");
  parent.father = "";
  initInvitation(config);
  assert.equal(names().children.length, 1); // No orphan flower or separator.
  parent.motherDeceased = false;
  initInvitation(config);
  assert.equal(names().children[0].children.length, 1);
  parent.image = { visible: true, src: './assets/images/groom.jpg', alt: '신랑 사진' };
  parent.images = undefined; // Exercise legacy single-image mode independently of user configuration.
  initInvitation(config);
  const photo = () => families.children[0].children.find(node => node.className === 'family-photo');
  assert.equal(photo().children[1].src, parent.image.src);
  assert.equal(photo().children[1].loading, 'lazy');
  assert(photo().children[0].hidden);
  photo().children[1].onerror();
  assert(photo().children[1].hidden && !photo().children[0].hidden);
  parent.description = '<script>plain text</script>\n둘째 아들';
  initInvitation(config);
  assert.equal(families.children[0].children.find(node => node.className === 'family-description').textContent, parent.description);
  parent.image.visible = false;
  initInvitation(config);
  assert.equal(photo(), undefined);
  config.invitation.parents = [];
  initInvitation(config);
  assert.equal(families.hidden, true);
  const originalSet = globalThis.setInterval, originalClear = globalThis.clearInterval;
  const timers = new Map(); let id = 0;
  globalThis.setInterval = (callback, delay) => { assert.equal(delay, 5000); timers.set(++id, callback); return id; };
  globalThis.clearInterval = key => timers.delete(key);
  try {
    const container = new Node(), fallback = new Node();
    const dispose = initFamilySlideshow(container, fallback, [{ src: 'one.jpg' }, { src: 'two.jpg' }, { src: 'broken.jpg' }]);
    const [first, second, broken] = container.children;
    first.onload(); second.onload(); broken.onerror();
    assert.equal(container.children.length, 3);
    assert.equal(timers.size, 1);
    assert.equal(first.attributes['data-active'], 'true');
    [...timers.values()][0]();
    assert.equal(second.attributes['data-active'], 'true');
    assert.equal(first.attributes['aria-hidden'], 'true');
    [...timers.values()][0]();
    assert.equal(first.attributes['data-active'], 'true');
    dispose(); assert.equal(timers.size, 0); assert.equal(first.onload, null);
    globalThis.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
    const reduced = new Node();
    const disposeReduced = initFamilySlideshow(reduced, new Node(), [{ src: '1.jpg' }, { src: '2.jpg' }]);
    reduced.children[0].onload(); reduced.children[1].onload();
    assert.equal(timers.size, 0);
    disposeReduced();
  } finally {
    globalThis.setInterval = originalSet; globalThis.clearInterval = originalClear;
    delete globalThis.matchMedia;
  }
} finally {
  delete globalThis.document;
}
console.log("PASS: memorial names, accessible flower, safe text, empty names and re-rendering");
