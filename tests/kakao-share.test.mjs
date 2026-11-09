import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getWeddingConfig } from "../js/core/config.js";
import { getKakaoSharePayload, publicHttpsUrl, initKakaoShare } from "../js/services/kakao-share.js";
import { renderShareMetadata } from "../scripts/build-share-meta.mjs";

const config = getWeddingConfig();
config.share.url = "https://example.com/invitation/";
const payload = getKakaoSharePayload(config, "http://localhost:8000/");
assert.equal(payload.content.imageUrl, "https://example.com/invitation/assets/images/og/wedding.png");
assert.equal(payload.content.link.mobileWebUrl, config.share.url);
for (const url of ["http://example.com/", "https://127.0.0.1/", "https://192.168.1.4/", "https://user:pass@example.com/", "file:///image.png"]) {
  assert.throws(() => publicHttpsUrl(url));
}
const broken = structuredClone(config); broken.share.image.src = "https://example.com/photo.svg";
assert.throws(() => getKakaoSharePayload(broken), /image/);
broken.share.image.visible = false; assert.throws(() => getKakaoSharePayload(broken), /image/);
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
config.share.title = '초대 <img src=x> & "함께"';
const rendered = renderShareMetadata(html, config);
assert(rendered.includes('content="초대 &lt;img src=x&gt; &amp; &quot;함께&quot;"'));
assert(rendered.includes('property="og:image" content="https://example.com/invitation/assets/images/og/wedding.png"'));
assert.equal(renderShareMetadata(rendered, config), rendered);
const overridden = renderShareMetadata(html, config, "https://other.example/new/");
assert(overridden.includes('property="og:url" content="https://other.example/new/"'));
assert(overridden.includes('property="og:image" content="https://other.example/new/assets/images/og/wedding.png"'));

class Node {
  hidden = false; textContent = ""; handlers = [];
  addEventListener(type, fn, options) { this.handlers.push({ fn, signal: options.signal }); }
  click() { for (const h of this.handlers) if (!h.signal.aborted) h.fn(); }
}
const button = new Node(), status = new Node();
globalThis.document = { baseURI: "https://example.com/invitation/", querySelector: selector => selector === "[data-share-button]" ? button : status };
let initialized = false, initializations = 0, sent = [];
const sdk = { init() { initialized = true; initializations++; }, isInitialized: () => initialized,
  Auth: { getAppKey: () => "test" }, Share: { sendDefault: value => { sent.push(value); } } };
const dependencies = { loadSdk: async () => sdk, checkImage: async () => {} };
const flush = () => new Promise(resolve => setImmediate(resolve));
initKakaoShare(config, { kakaoJavascriptKey: "test" }, dependencies);
assert(button.disabled); await flush(); assert(!button.disabled);
button.click(); assert.equal(sent.length, 1); // Called immediately, not after an await.
assert.equal(status.textContent, config.labels.shareOpened);
initKakaoShare(config, { kakaoJavascriptKey: "test" }, dependencies);
await flush(); button.click(); assert.equal(sent.length, 2); assert.equal(initializations, 1);
sdk.Share.sendDefault = () => { throw Error("blocked"); };
button.click(); assert.equal(status.textContent, config.labels.shareSendError);
initKakaoShare(config, {}, dependencies); await flush();
assert.equal(status.textContent, config.labels.shareNoKey);
initKakaoShare(config, { kakaoJavascriptKey: "test" }, { ...dependencies, checkImage: async () => { throw Error("image"); } });
await flush(); assert.equal(status.textContent, config.labels.shareInvalidImage);
let fail = true;
initKakaoShare(config, { kakaoJavascriptKey: "test" }, { ...dependencies, loadSdk: async () => { if (fail) throw Error("sdk"); return sdk; } });
await flush(); assert.equal(status.textContent, config.labels.shareSdkError);
fail = false; button.click(); await flush(); assert.equal(status.textContent, config.labels.shareReady);
console.log("PASS: HTTPS URL/image validation, payload, static escaped OG tags, SDK init/retry, synchronous sharing, error UI and listener cleanup.");
