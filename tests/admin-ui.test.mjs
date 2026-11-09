import assert from "node:assert/strict";
class Node {
  children = []; handlers = {}; attributes = {}; textContent = ""; value = ""; hidden = false;
  constructor(tag = "div") { this.tag = tag; }
  append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
  replaceChildren() { this.children = []; }
  remove() { this.parent.children = this.parent.children.filter(node => node !== this); }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(key, handler) { this.handlers[key] = handler; }
  querySelector() { return nodes.get("login-button"); }
  focus() { document.activeElement = this; }
  click() { this.handlers.click?.(); }
}
const ids = ["#admin-login", "#admin-status", "#entries", "#more", "#manage-panel", "#login-panel", "#board-label", "#board-password", "#board-id", "#manage-title", "#refresh", "#logout", "#export", "login-button"];
const nodes = new Map(ids.map(id => [id, new Node()]));
const timers = new Map(); let next = 0, allowDelete = false;
const original = { fetch: globalThis.fetch, setTimeout, clearTimeout };
globalThis.document = { querySelector: id => nodes.get(id), querySelectorAll: () => [...nodes.values()], createElement: tag => new Node(tag), body: new Node() };
globalThis.window = { addEventListener() {} };
globalThis.confirm = () => allowDelete;
globalThis.setTimeout = fn => { timers.set(++next, fn); return next; };
globalThis.clearTimeout = id => timers.delete(id);
let row = { id: "1", name: '<img src=x onerror="attack()">', message: '<script>attack()</script>', approved: false, created_at: "2026-11-08T00:00:00Z" };
let error = null, deletes = 0;
globalThis.fetch = async (url, options) => {
  const body = JSON.parse(options.body);
  let result;
  if (error) result = { error };
  else if (body.p_action === "login") result = { token: "f".repeat(64) };
  else if (body.p_action === "list") result = { entries: row ? [{ ...row }] : [], max_id: "1", has_more: false };
  else {
    if (body.p_action === "set_approval") row.approved = body.p_approved;
    if (body.p_action === "delete") { row = null; deletes++; }
    result = { ok: true };
  }
  return { ok: true, json: async () => result };
};
const flush = () => new Promise(resolve => setImmediate(resolve));
try {
  await import("../js/admin.js");
  nodes.get("#board-id").value = "default"; nodes.get("#board-password").value = "test-password";
  nodes.get("#admin-login").handlers.submit({ preventDefault() {} }); await flush();
  assert.equal(nodes.get("#board-password").value, "");
  assert.equal(nodes.get("#login-panel").hidden, true);
  const card = nodes.get("#entries").children[0];
  assert.equal(card.children[0].children[0].textContent, row.name);
  assert.equal(card.children[2].textContent, row.message);
  assert.equal(card.children[2].children.length, 0);
  const [toggle, remove] = card.children[3].children;
  toggle.click(); await flush(); assert.equal(row.approved, true);
  assert.equal(toggle.textContent, "비공개로 변경");
  remove.click(); await flush(); assert.equal(deletes, 0);
  allowDelete = true; remove.click(); await flush(); assert.equal(deletes, 1);
  assert.equal(nodes.get("#entries").children.length, 0);
  error = "unauthorized"; nodes.get("#refresh").click(); await flush();
  assert.equal(nodes.get("#manage-panel").hidden, true);
  assert.equal(nodes.get("#login-panel").hidden, false);
  assert.match(nodes.get("#admin-status").textContent, /만료/);
} finally {
  Object.assign(globalThis, original);
  delete globalThis.document; delete globalThis.window; delete globalThis.confirm;
}
console.log("PASS: admin UI safe text, password clearing, approval feedback, delete cancel/confirm and expired session cleanup");
