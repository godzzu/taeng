import assert from "node:assert/strict";
import { getWeddingConfig } from "../js/core/config.js";
import { weddingConfig } from "../config/wedding.config.js";
import { initAccount } from "../js/sections/account.js";
import { initContact } from "../js/sections/contact.js";
class Node {
  nodes = new Map(); children = []; attributes = {}; handlers = [];
  hidden = false; textContent = ""; className = "";
  classList = { add: () => {}, remove: () => {} };
  querySelector(key) { if (!this.nodes.has(key)) this.nodes.set(key, new Node()); return this.nodes.get(key); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(name, fn, options) { this.handlers.push({ name, fn, signal: options?.signal }); }
  async click() { for (const h of this.handlers) if (h.name === "click" && !h.signal?.aborted) await h.fn(); }
  focus() { document.activeElement = this; }
  select() { this.selected = true; }
  setSelectionRange(start, end) { this.selection = [start, end]; }
}
const account = new Node(), contact = new Node(), trigger = new Node(), toast = new Node();
globalThis.document = {
  querySelector: selector => selector === "#account" ? account : selector === "[data-contact-dialog]" ? contact : selector === "[data-contact-open]" ? trigger : toast,
  createElement: () => new Node(), activeElement: null
};
const timers = new Map(); let nextTimer = 0;
globalThis.window = {
  clearTimeout: id => timers.delete(id),
  setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; }
};
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard: {} } });
// Native modal lifecycle: scroll styles and focus are restored on every close path.
const style = () => ({ values: new Map(), getPropertyValue(k) { return this.values.get(k)?.[0] || ""; }, getPropertyPriority(k) { return this.values.get(k)?.[1] || ""; }, setProperty(k, v, p = "") { this.values.set(k, [v, p]); }, removeProperty(k) { this.values.delete(k); } });
document.documentElement = { style: style() };
document.body = { style: style() };
document.body.style.setProperty("position", "relative", "important");
window.scrollX = 0; window.scrollY = 230;
window.scrollTo = (x, y) => { assert.equal(x, 0); assert.equal(y, 230); };
const dispatch = (node, type, event = {}) => { for (const h of node.handlers) if (h.name === type && !h.signal?.aborted) h.fn(event); };
contact.showModal = () => { contact.open = true; };
contact.close = () => { contact.open = false; dispatch(contact, "close"); };

const raw = structuredClone(weddingConfig);
raw.account.items.push({ id: "groom-parent", visible: true, side: "groom" });
raw.contact.items.push({ id: "groom-parent", visible: true, person: "groomMother" });
const config = getWeddingConfig(raw);
const fixtureNumber = "001-234-567"; // Synthetic test data only.
let requests = 0;
const api = {
  async accounts(refs) { requests++; return refs.map(r => ({ ...r, label: "신랑 측", bank: "테스트은행", holder: "테스트", number: fixtureNumber })); },
  async contacts(refs) { requests++; return refs.map(r => ({ ...r, side: r.person.startsWith("groom") ? "groom" : "bride", label: r.person === "groomMother" ? "신랑 어머니" : "신랑/신부", name: "테스트", dialNumber: "+821012345678" })); }
};
const flush = () => new Promise(resolve => setImmediate(resolve));
assert.equal(config.contact.items.length, 3);
const accountCards = () => account.querySelector('[data-field="accounts"]').children.flatMap(group => group.children[1].children);
for (const templateId of ["wedding-floral", "wedding-sketch", "wedding-ticket", "wedding-marble", "wedding-autumn", "moonlight"]) {
  config.templateId = templateId;
  const beforeRequests = requests;
  initAccount(config, {}, api); initContact(config, {}, api);
  assert.equal(requests, beforeRequests);
  const groups = account.querySelector('[data-field="accounts"]').children;
  assert.equal(groups.length, 2);
  for (const group of groups) { group.open = true; dispatch(group, "toggle"); }
  await trigger.click(); await flush();
  assert.equal(groups[0].children[0].textContent, config.account.groupTitles.groom);
  assert.equal(groups[0].children[1].children.length, 2);
  const cards = accountCards();
  assert.equal(cards.length, 3);
  const [, payment, fallback] = cards[1].children;
  const [details, button] = payment.children;
  assert.equal(details.children[1].textContent, "001-234-567");
  let copied;
  navigator.clipboard.writeText = async text => { copied = text; };
  await button.click();
  assert.equal(copied, "001-234-567"); assert.equal(toast.textContent, config.labels.accountCopied);
  assert(fallback.hidden); assert.equal(button.disabled, false);
  navigator.clipboard.writeText = async () => { throw Error("denied"); };
  await button.click();
  assert(!fallback.hidden);
  const input = fallback.children[1].children[0];
  assert(input.readOnly && input.selected);
  assert.deepEqual(input.selection, [0, 11]);
  assert.equal(document.activeElement, input);
  delete navigator.clipboard.writeText;
  await button.click(); assert(!fallback.hidden);
  navigator.clipboard.writeText = async () => {};
  await button.click(); assert(fallback.hidden);
  assert.equal(document.activeElement, button);
  assert.equal(timers.size, 1);
  const people = contact.querySelector('[data-field="contacts"]').children;
  assert.equal(people.length, 3);
  assert.equal(people[1].children[2].children[0].href, "tel:+821012345678");
  assert.equal(people[1].children[2].children[1].href, "sms:+821012345678");
  assert.match(people[1].children[2].children[0].attributes["aria-label"], /신랑 어머니/);
}
let resolveCopy;
navigator.clipboard.writeText = () => new Promise(resolve => { resolveCopy = resolve; });
const oldButton = accountCards()[0].children[1].children[1];
const pending = oldButton.click();
initAccount(config, {}, api);
toast.textContent = "unchanged";
resolveCopy(); await pending; assert.equal(toast.textContent, "unchanged");
config.account.visible = config.contact.visible = false;
initAccount(config, {}, api); initContact(config, {}, api);
assert(account.hidden && trigger.hidden);
assert.equal(contact.querySelector('[data-field="contacts"]').children.length, 0);
assert.equal(account.querySelector('[data-field="accounts"]').children.length, 0);
config.contact.visible = true;
initContact(config, {}, api);
await trigger.click();
assert(contact.open);
assert.equal(document.body.style.getPropertyValue("position"), "fixed");
assert.equal(document.activeElement, contact.querySelector("[data-contact-close]"));
dispatch(contact, "cancel", { preventDefault() {} });
assert(!contact.open);
assert.equal(document.activeElement, trigger);
assert.equal(document.body.style.getPropertyValue("position"), "relative");
assert.equal(document.body.style.getPropertyPriority("position"), "important");
await trigger.click();
dispatch(contact, "pointerdown", { target: contact });
dispatch(contact, "click", { target: contact });
assert(!contact.open);
await trigger.click();
await contact.querySelector("[data-contact-close]").click();
assert(!contact.open);
await trigger.click();
initContact(config, {}, api);
assert(!contact.open);
assert.equal(document.documentElement.style.getPropertyValue("overflow"), "");
const privateConfig = structuredClone(weddingConfig);
privateConfig.contact.items = [
  { id: "father", person: "groomFather" },
  { id: "mother", person: "brideMother", visible: "true" },
  { id: "mother", person: "groomMother", visible: true }
];
const normalized = getWeddingConfig(privateConfig);
assert.equal(normalized.contact.items.length, 1);
assert.equal(normalized.contact.items[0].person, "groomMother");
assert.equal(normalized.contact.items[0].id, "mother");
assert(!("phone" in normalized.contact.items[0]));
console.log("PASS: contact modal open/close/ESC/backdrop/reinitialization, focus and scroll restore, explicit privacy opt-in");
console.log("PASS: multiple accounts, exact copied number, denied/missing Clipboard API, manual selection, parent contact visibility, tel/sms, toast timer and async cleanup.");
