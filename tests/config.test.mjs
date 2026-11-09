import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const moduleUrl = source => "data:text/javascript;base64," + Buffer.from(source).toString("base64");
const raw = await readFile(new URL("../config/wedding.config.js", import.meta.url), "utf8");
const rawUrl = moduleUrl(raw);
const { weddingConfig } = await import(rawUrl);
const core = await readFile(new URL("../js/core/config.js", import.meta.url), "utf8");
const dateUrl = moduleUrl(await readFile(new URL("../js/core/date.js", import.meta.url), "utf8"));
const { getWeddingConfig } = await import(moduleUrl(core.replace('"../../config/wedding.config.js"', JSON.stringify(rawUrl)).replace('"./date.js"', JSON.stringify(dateUrl))));
const source = structuredClone(weddingConfig);
source.share.url = ""; // Exercise current-page fallback independently of deployment settings.
const config = getWeddingConfig(source);
assert.deepEqual(getWeddingConfig({ ...source, music: { visible: true, key: ' piano-01 ' } }).music, { visible: true, key: 'piano-01' });
assert.deepEqual(getWeddingConfig({ ...source, music: undefined }).music, { visible: true, key: '' });
assert.equal(getWeddingConfig({ ...source, music: { visible: false, key: 'piano-01' } }).music.visible, false);
assert.equal(config.invitation.parents[0].name, source.basic.groomName);
assert.equal(config.invitation.parents[1].name, source.basic.brideName);
const memorialSource = structuredClone(source);
memorialSource.invitation.parents[0].fatherDeceased = true;
memorialSource.invitation.parents[0].motherDeceased = "false";
delete memorialSource.invitation.parents[1].fatherDeceased;
const memorial = getWeddingConfig(memorialSource).invitation.parents;
assert.equal(memorial[0].fatherDeceased, true);
assert.equal(memorial[0].motherDeceased, false);
assert.equal(memorial[1].fatherDeceased, false);
assert.equal(memorial[0].father, source.invitation.parents[0].father);
const hiddenFamily = structuredClone(source);
hiddenFamily.invitation.parents[0].visible = false;
assert.equal(getWeddingConfig(hiddenFamily).invitation.parents[0].name, source.basic.brideName);
for (const templateId of ["wedding-floral", "wedding-sketch", "wedding-ticket"]) {
  assert.equal(getWeddingConfig({ ...source, templateId }).templateId, templateId);
}
assert.equal(config.gallery.items.length, 3);
const accountSource = structuredClone(source);
accountSource.account.items = [
  { label: "신랑 아버지", number: "001" },
  { label: "신부 어머니", number: "002" },
  { label: "기타", number: "003" },
  { side: "bride", label: "부모님", number: "004" },
  { side: "groom", visible: false, number: "005" }
];
assert.deepEqual(getWeddingConfig(accountSource).account.items.map(row => row.side), ["groom", "bride", "other", "bride"]);
assert.equal(config.basic.timeLabel, "오후 12시 30분");
assert.match(config.basic.dateLabel, /토요일/);
assert(config.invitation.message.includes("\n"));
assert.equal(config.contact.items[0].name, source.basic.groomName);
config.account.items[0].number = "changed";
assert.notEqual(source.account.items[0].number, "changed");
source.basic.groomName = "새 이름";
source.basic.weddingDate = "2028-02-29";
source.basic.weddingTime = "00:00";
source.gallery.items[0].visible = false;
source.account.items.forEach(item => { item.visible = false; });
source.location.coordinates = { latitude: 0, longitude: 0 };
source.location.links.push({ url: "javascript:alert(1)" });
source.hero.image.src = "data:text/html,unsafe";
let changed = getWeddingConfig(source);
assert.match(changed.share.title, /새 이름/);
assert.equal(changed.basic.timeLabel, "오전 12시");
assert.equal(changed.gallery.items.length, 2);
assert.equal(changed.account.visible, false);
assert.deepEqual(changed.location.coordinates, { latitude: 0, longitude: 0 });
assert.equal(changed.location.links.length, 2);
assert.equal(changed.hero.image.src, "");
source.location.coordinates.latitude = 91;
assert.equal(getWeddingConfig(source).location.coordinates, null);
source.basic.weddingDate = "2027-02-29";
assert.throws(() => getWeddingConfig(source), /weddingDate/);
source.basic.weddingDate = "2027-05-15";
source.basic.weddingTime = "24:00";
assert.throws(() => getWeddingConfig(source), /weddingTime/);
source.basic.weddingTime = "12:00";
source.share.title = "직접 작성한 공유 제목";
source.share.description = "직접 작성한 설명";
source.templateId = "unknown";
changed = getWeddingConfig(source);
assert.equal(changed.share.title, source.share.title);
assert.equal(changed.templateId, "wedding-floral");
assert.equal(getWeddingConfig({ basic: source.basic }).gallery.visible, false);
assert.equal(getWeddingConfig({ basic: source.basic }).guestbook.visible, false);
const shareSource = await readFile(new URL("../js/services/kakao-share.js", import.meta.url), "utf8");
const { getKakaoSharePayload } = await import(moduleUrl(shareSource));
const payload = getKakaoSharePayload(changed, "https://example.com/wedding/");
assert.equal(payload.content.title, source.share.title);
assert.equal(payload.content.imageUrl, "https://example.com/wedding/assets/images/og/wedding.png");
assert.equal(payload.content.link.webUrl, "https://example.com/wedding/");
console.log("PASS: config normalization, date validation, visibility, isolation, URL filtering, derived content and share payload");

// Only the root theme and metadata may change; no section DOM is available here.
const { applyTheme } = await import("../js/core/theme.js");
const themeMeta = { content: "" };
globalThis.document = {
  documentElement: { dataset: {} },
  querySelector(selector) {
    assert.equal(selector, 'meta[name="theme-color"]');
    return themeMeta;
  }
};
globalThis.getComputedStyle = () => ({ getPropertyValue: () => " #0d1c42 " });
for (const id of ["wedding-ticket", "wedding-floral", "wedding-sketch", "wedding-ticket"]) {
  assert.equal(applyTheme(id), id);
  assert.equal(document.documentElement.dataset.theme, id);
  assert.equal(themeMeta.content, "#0d1c42");
}
assert.equal(applyTheme("unknown"), "wedding-floral");
delete globalThis.document;
delete globalThis.getComputedStyle;
console.log("PASS: three-theme switching, theme-color and fallback without section rendering");
