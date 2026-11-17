import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function publicConfig(env = process.env) {
  const value = key => (env[key] || "").trim();
  const key = value("PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (key && !key.startsWith("sb_publishable_")) {
    let role;
    try { role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role; } catch {}
    if (role !== "anon") throw new Error("PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a publishable or legacy anon key. Server secrets must not be published.");
  }
  // Explicit allowlist: other environment variables never enter browser output.
  return {
    kakaoJavascriptKey: value("PUBLIC_KAKAO_JAVASCRIPT_KEY"),
    kakaoMapJavascriptKey: value("PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY"),
    guestbookProvider: value("PUBLIC_GUESTBOOK_PROVIDER") || "supabase",
    supabaseUrl: value("PUBLIC_SUPABASE_URL"),
    supabasePublishableKey: key,
    guestbookWeddingId: value("PUBLIC_GUESTBOOK_WEDDING_ID") || "default"
  };
}
export async function writePublicConfig(destination = new URL("../config/public-env.js", import.meta.url), env = process.env) {
  const config = publicConfig(env);
  const file = destination instanceof URL ? fileURLToPath(destination) : destination;
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `// Generated browser-public configuration. Do not edit.\nexport const publicEnv = ${JSON.stringify(config, null, 2)};\n`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writePublicConfig();
  console.log("Public browser configuration generated.");
}
