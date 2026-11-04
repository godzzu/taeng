import assert from "node:assert/strict";
import { once } from "node:events";
import { createDevServer } from "../scripts/dev-server.mjs";

const server = createDevServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const html = await response.text();
  assert.match(html, /type="module" src="\.\/js\/main.js"/);
  const visited = new Set();
  async function checkModule(path) {
    if (visited.has(path)) return;
    visited.add(path);
    const result = await fetch(path);
    assert.equal(result.status, 200, path);
    assert.match(result.headers.get("content-type"), /text\/javascript/);
    const source = await result.text();
    for (const [, dependency] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
      await checkModule(new URL(dependency, path).href);
    }
  }
  await checkModule(`${base}/js/main.js`);
  for (const [, css] of html.matchAll(/href="(\.\/css\/[^"?]+)"/g)) {
    const cssUrl = new URL(css, base);
    const result = await fetch(cssUrl);
    assert.equal(result.status, 200);
    assert.match(result.headers.get("content-type"), /text\/css/);
    for (const [, image] of (await result.text()).matchAll(/url\("([^"]+)"\)/g)) {
      assert.equal((await fetch(new URL(image, cssUrl))).status, 200, image);
    }
  }
  assert.equal((await fetch(`${base}/assets/images/gallery/photo-01.svg`)).status, 200);
  for (const path of ["/.git/config", "/.env", "/package.json", "/missing.js", "/assets/%2e%2e%2fpackage.json", "/assets/C:%5Csecret"]) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
  assert.equal((await fetch(base + "/%zz")).status, 400);
  assert.equal((await fetch(base, { method: "POST" })).status, 405);
  const head = await fetch(base, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  console.log(`PASS: HTTP entry point, ${visited.size} modules, CSS/assets, HEAD and invalid requests`);
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
