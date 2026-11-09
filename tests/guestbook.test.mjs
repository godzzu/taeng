import assert from "node:assert/strict";
import { createGuestbookApi, validateGuestbookEntry } from "../js/services/guestbook-api.js";
const settings = { guestbookProvider: "supabase", supabaseUrl: "https://example.supabase.co", supabasePublishableKey: "sb_publishable_test", guestbookWeddingId: "default" };
assert.equal(validateGuestbookEntry({ name: "  ", message: "hi" }).invalid, "name");
assert.equal(validateGuestbookEntry({ name: "A", message: "x".repeat(301) }).invalid, "message");
assert.equal(validateGuestbookEntry({ name: " A ", message: "a\r\nb" }).message, "a\nb");
assert(!createGuestbookApi({}).configured);
assert(createGuestbookApi(settings).configured);
assert(!createGuestbookApi({ ...settings, supabaseUrl: settings.supabaseUrl + "/functions/v1/guestbook" }).configured);
assert(!createGuestbookApi({ ...settings, supabasePublishableKey: "sb_secret_test" }).configured);
const entry = { name: "<img src=x onerror=alert(1)>", message: "<script>alert(1)</script>\n축하합니다", clientId: "00000000-0000-4000-8000-000000000001", requestId: "00000000-0000-4000-8000-000000000002" };
let calls = [];
const api = createGuestbookApi(settings, async (url, options) => {
  calls.push({ url, options });
  return { ok: true, json: async () => url.endsWith("list_guestbook")
    ? { entries: [{ id: "9007199254740993", name: entry.name, message: entry.message, created_at: "2027-05-15T00:00:00Z" }], has_more: false }
    : { id: "1", approved: false } };
});
const page = await api.list({ before: "9007199254740995" });
assert.equal(page.entries[0].id, "9007199254740993");
assert.equal(page.entries[0].message, entry.message);
assert.equal(JSON.parse(calls[0].options.body).p_before, "9007199254740995");
assert.equal((await api.create(entry)).approved, false);
assert.equal(calls[1].options.headers.apikey, settings.supabasePublishableKey);
assert.equal(JSON.parse(calls[1].options.body).p_request_id, entry.requestId);
await api.create(entry);
assert.equal(JSON.parse(calls[2].options.body).p_request_id, entry.requestId);
for (const code of ["rate_limit", "duplicate", "closed"]) {
  const failing = createGuestbookApi(settings, async () => ({ ok: true, json: async () => ({ error: code }) }));
  await assert.rejects(failing.create(entry), error => error.code === code);
}
const offline = createGuestbookApi(settings, async () => { throw Error("offline"); });
await assert.rejects(offline.list(), error => error.code === "network");
const invalid = createGuestbookApi(settings, async () => ({ ok: true, json: async () => ({ entries: [{}] }) }));
await assert.rejects(invalid.list(), error => error.code === "network");
await assert.rejects(api.create({ name: "", message: "" }), error => error.code === "name");
console.log("PASS: guestbook limits, normalization, RPC payloads, large IDs, retry IDs, error handling and plain-text payloads.");


import { initGuestbook } from "../js/sections/guestbook.js";
import { getWeddingConfig } from "../js/core/config.js";
import { randomUUID } from "node:crypto";
class Node {
  nodes = new Map(); children = []; handlers = []; value = ""; dataset = {}; attributes = {};
  querySelector(key) { if (!this.nodes.has(key)) this.nodes.set(key, new Node()); return this.nodes.get(key); }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  setAttribute(key, value) { this.attributes[key] = value; }
  removeAttribute(key) { delete this.attributes[key]; }
  setCustomValidity(value) { this.invalid = value; }
  reportValidity() { return !this.invalid; }
  focus() { this.focused = true; }
  addEventListener(type, fn, options) { this.handlers.push({ type, fn, signal: options.signal }); }
  async fire(type) { for (const h of this.handlers) if (h.type === type && !h.signal.aborted) await h.fn({ preventDefault() {} }); }
  set innerHTML(value) { throw Error("Unsafe HTML insertion"); }
}
const section = new Node(), form = section.querySelector("[data-guestbook-form]");
const fields = { name: new Node(), message: new Node(), website: new Node() };
form.elements = { namedItem: name => fields[name] };
form.reset = () => { for (const input of Object.values(fields)) input.value = ""; };
globalThis.document = { querySelector: () => section, createElement: () => new Node() };
globalThis.localStorage = { getItem: () => null, setItem() {} };
if (!globalThis.crypto) globalThis.crypto = { randomUUID };
let mode = "network", posts = [];
globalThis.fetch = async (url, options) => {
  if (url.endsWith("list_guestbook")) return { ok: true, json: async () => ({ entries: page.entries, has_more: false }) };
  posts.push(JSON.parse(options.body));
  if (mode === "network") throw Error("lost connection");
  return { ok: true, json: async () => ({ id: "4", approved: false }) };
};
const config = getWeddingConfig();
config.guestbook.visible = true;
initGuestbook(config, settings);
await new Promise(resolve => setImmediate(resolve));
const cards = section.querySelector('[data-field="guestbook-list"]').children;
assert.equal(cards[0].children[0].textContent, entry.name);
assert.equal(cards[0].children[2].textContent, entry.message);
fields.name.value = " ";
fields.message.value = "축하합니다";
await form.fire("submit");
assert.equal(posts.length, 0);
assert(fields.name.focused);
fields.name.value = "친구"; await fields.name.fire("input");
await form.fire("submit");
assert.equal(fields.message.value, "축하합니다");
assert.equal(section.querySelector('[data-field="guestbook-status"]').textContent, config.labels.guestError);
mode = "success";
await form.fire("submit");
assert.equal(posts[0].p_request_id, posts[1].p_request_id);
assert.equal(fields.name.value, "");
assert.equal(section.querySelector('[data-field="guestbook-status"]').textContent, config.labels.guestPending);
initGuestbook(config, {});
assert(form.querySelector('button[type="submit"]').disabled);
console.log("PASS: text-only XSS rendering, input validation, draft retention, retry idempotency, moderation status and unconfigured UI.");
