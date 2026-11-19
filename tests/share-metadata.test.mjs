import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getWeddingConfig } from "../js/core/config.js";
import { getShareMetadata, publicHttpsUrl } from "../js/core/share-metadata.js";
import { renderShareMetadata } from "../scripts/build-share-meta.mjs";

const config = getWeddingConfig();
config.share.image.src = "./assets/images/og/wedding.png";
config.share.url = "https://example.com/invitation/";
const payload = getShareMetadata(config);
assert.equal(payload.imageUrl, "https://example.com/invitation/assets/images/og/wedding.png");
assert.equal(payload.url, config.share.url);
for (const url of ["http://example.com/", "https://127.0.0.1/", "https://192.168.1.4/", "https://user:pass@example.com/", "file:///image.png"]) {
  assert.throws(() => publicHttpsUrl(url));
}
const broken = structuredClone(config); broken.share.image.src = "https://example.com/photo.svg";
assert.throws(() => getShareMetadata(broken), /image/);
broken.share.image.visible = false; assert.throws(() => getShareMetadata(broken), /image/);
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
config.share.title = '초대 <img src=x> & "함께"';
const rendered = renderShareMetadata(html, config);
assert(rendered.includes('content="초대 &lt;img src=x&gt; &amp; &quot;함께&quot;"'));
assert(rendered.includes('property="og:image" content="https://example.com/invitation/assets/images/og/wedding.png"'));
assert.equal(renderShareMetadata(rendered, config), rendered);
const overridden = renderShareMetadata(html, config, "https://other.example/new/");
assert(overridden.includes('property="og:url" content="https://other.example/new/"'));
assert(overridden.includes('property="og:image" content="https://other.example/new/assets/images/og/wedding.png"'));

const blank = structuredClone(config); blank.share.url = "";
assert(renderShareMetadata(html, blank).includes('property="og:url" content=""'));
assert.throws(() => renderShareMetadata(html.replace('property="og:image"', 'property="removed"'), config), /Missing meta tag/);
console.log("PASS: OG public HTTPS validation, image validation, escaping, repeat builds, URL override and missing metadata");
