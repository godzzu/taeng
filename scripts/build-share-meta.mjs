import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getWeddingConfig } from "../js/core/config.js";
import { getKakaoSharePayload } from "../js/services/kakao-share.js";

const escape = value => String(value).replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
export function renderShareMetadata(html, config, baseUrl = config.share.url) {
  const content = baseUrl ? getKakaoSharePayload({ ...config, share: { ...config.share, url: baseUrl } }, baseUrl).content : null;
  const values = {
    description: config.share.description, "og:type": "website", "og:locale": "ko_KR",
    "og:title": config.share.title, "og:description": config.share.description,
    "og:url": content?.link.webUrl || "", "og:image": content?.imageUrl || "",
    "og:image:alt": config.share.image.alt
  };
  for (const [name, value] of Object.entries(values)) {
    const attribute = name.startsWith("og:") ? "property" : "name";
    const pattern = new RegExp(`<meta ${attribute}="${name}" content="[^"]*"> `.trim());
    if (!pattern.test(html)) throw new Error("Missing meta tag: " + name);
    html = html.replace(pattern, () => `<meta ${attribute}="${name}" content="${escape(value)}">`);
  }
  return html.replace(/<title>[^<]*<\/title>/, () => `<title>${escape(config.share.title)}</title>`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== "--url")) throw new Error("Usage: npm run build:meta -- --url https://your-domain/path/");
  const config = getWeddingConfig();
  const url = args[1] || config.share.url;
  const file = new URL("../index.html", import.meta.url);
  await writeFile(file, renderShareMetadata(await readFile(file, "utf8"), config, url));
  console.log(url ? "Open Graph metadata generated." : "제목·설명 메타 생성 완료. 공유 URL 미설정: 배포 전에 share.url 설정 후 다시 실행하세요.");
}
