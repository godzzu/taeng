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
const account = new Node(), contact = new Node(), toast = new Node();
globalThis.document = {
  querySelector: selector => selector === "#account" ? account : selector === "#contact" ? contact : toast,
  createElement: () => new Node(), activeElement: null
};
const timers = new Map(); let nextTimer = 0;
globalThis.window = {
  clearTimeout: id => timers.delete(id),
  setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; }
};
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard: {} } });
const raw = structuredClone(weddingConfig);
raw.account.items.push({ visible: true, label: "신랑 측", bank: "은행", holder: "부모님", number: "001-234-567" });
raw.contact.items.push(
  { visible: true, label: "신랑 어머니", name: "어머니", phone: "+82 (10) 1234-5678" },
  { visible: false, label: "숨김", name: "숨김", phone: "010-1111-2222" },
  { visible: true, name: "잘못된 번호", phone: "abc123" }
);
const config = getWeddingConfig(raw);
assert.equal(config.contact.items.length, 3);
assert.equal(config.contact.items[2].dialNumber, "+821012345678");
for (const templateId of ["wedding-floral", "wedding-sketch"]) {
  config.templateId = templateId;
  initAccount(config); initContact(config);
  const cards = account.querySelector('[data-field="accounts"]').children;
  assert.equal(cards.length, 3);
  const [details, button, fallback] = cards[2].children;
  assert.equal(details.children[2].textContent, "001-234-567");
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
  assert.equal(people[2].children[2].children[0].href, "tel:+821012345678");
  assert.equal(people[2].children[2].children[1].href, "sms:+821012345678");
  assert.match(people[2].children[2].children[0].attributes["aria-label"], /신랑 어머니/);
}
let resolveCopy;
navigator.clipboard.writeText = () => new Promise(resolve => { resolveCopy = resolve; });
const oldButton = account.querySelector('[data-field="accounts"]').children[0].children[1];
const pending = oldButton.click();
initAccount(config);
toast.textContent = "unchanged";
resolveCopy(); await pending; assert.equal(toast.textContent, "unchanged");
config.account.visible = config.contact.visible = false;
initAccount(config); initContact(config);
assert(account.hidden && contact.hidden);
assert.equal(contact.querySelector('[data-field="contacts"]').children.length, 0);
assert.equal(account.querySelector('[data-field="accounts"]').children.length, 0);
console.log("PASS: multiple accounts, exact copied number, denied/missing Clipboard API, manual selection, parent contact visibility, tel/sms, toast timer and async cleanup.");
