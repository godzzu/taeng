import assert from "node:assert/strict";
import { getWeddingConfig } from "../js/core/config.js";
import { initInvitation } from "../js/sections/invitation.js";

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
  const names = () => families.children[0].children.find(node => node.className === "family-parents");
  const father = names().children[0];
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
  config.invitation.parents = [];
  initInvitation(config);
  assert.equal(families.hidden, true);
} finally {
  delete globalThis.document;
}
console.log("PASS: memorial names, accessible flower, safe text, empty names and re-rendering");
