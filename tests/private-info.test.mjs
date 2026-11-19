import assert from "node:assert/strict";
import { createPrivateInfoApi } from "../js/services/private-info-api.js";
import { createRemoteInfoLoader } from "../js/core/remote-info.js";
const settings = { supabaseUrl: "https://example.supabase.co", supabasePublishableKey: "sb_publishable_test", guestbookWeddingId: "test-board" };
const refs = [{ id: "groom", person: "groom" }];
let calls = 0, status = 200, response = [{ id: "groom", person: "groom", label: "신랑", name: "<script>test</script>", phone: "+82 (10) 0000-0000" }];
const api = createPrivateInfoApi(settings, async (url, options) => {
  calls++;
  assert.equal(options.cache, "no-store");
  const body = JSON.parse(options.body);
  assert.equal(body.p_wedding_id, "test-board");
  assert.deepEqual(body.p_ids, ["groom"]);
  assert(!("phone" in body));
  return { ok: status === 200, status, json: async () => response };
});
assert.equal(calls, 0);
const rows = await api.contacts(refs);
assert.equal(rows[0].dialNumber, "+821000000000");
assert.equal(rows[0].name, "<script>test</script>");
response = [{ id: "unrequested", person: "groom", label: "", name: "", phone: "123" }];
assert.deepEqual(await api.contacts(refs), []);
response = [{ id: "groom", person: "bride", label: "", name: "", phone: "123" }];
await assert.rejects(api.contacts(refs), /network/);
response[0].person = "groom"; response[0].phone = "javascript:alert(1)";
await assert.rejects(api.contacts(refs), /network/);
status = 404; await assert.rejects(api.contacts(refs), /not_installed/);
status = 403; await assert.rejects(api.contacts(refs), /network/);
await assert.rejects(createPrivateInfoApi({}).contacts(refs), /not_configured/);
status = 200; response = [{ id: "groom", side: "groom", label: "테스트", bank: "은행", holder: "테스트", account_number: "000-001" }];
assert.equal((await api.accounts([{ id: "groom", side: "groom" }]))[0].number, "000-001");
response = {}; await assert.rejects(api.accounts([{ id: "groom", side: "groom" }]), /network/);

class Node {
  children = []; attributes = {}; textContent = "";
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  setAttribute(k, v) { this.attributes[k] = v; }
  addEventListener(event, fn) { this[event] = fn; }
}
globalThis.document = { createElement: () => new Node() };
const container = new Node(), control = new AbortController();
let requests = 0, fail = true;
const load = createRemoteInfoLoader(container, async () => { requests++; if (fail) throw Error("network"); return [{ name: "<img onerror=test>" }]; }, rows => {
  const node = new Node(); node.textContent = rows[0].name; container.append(node);
}, control.signal);
assert.equal(requests, 0);
await load(); assert.equal(container.children[1].textContent, "다시 시도");
fail = false; await container.children[1].click();
assert.equal(container.children[0].textContent, "<img onerror=test>");
await load(); assert.equal(requests, 2); // Successful result is kept in page memory.
const empty = new Node(); await createRemoteInfoLoader(empty, async () => [], () => assert.fail(), control.signal)();
assert.match(empty.children[0].textContent, /공개된 정보가 없습니다/);
let resolve;
const pending = new Node(), aborted = new AbortController();
const run = createRemoteInfoLoader(pending, () => new Promise(r => { resolve = r; }), () => assert.fail("stale render"), aborted.signal);
const first = run(); await run(); aborted.abort(); resolve([{ id: "groom" }]); await first;
delete globalThis.document;
console.log("PASS: private info on-demand RPC, field validation, no-store, retry/cache/empty states and aborted rendering");
