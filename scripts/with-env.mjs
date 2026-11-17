import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const env = fileURLToPath(new URL("../.env", import.meta.url));
const args = process.argv.slice(2);
if (!args.length) throw new Error("A Node script is required.");
// Node's native dotenv parser; CI environment variables take precedence.
// Use a relative path: Node 20.10 on Windows can ignore drive-letter env paths.
const child = spawnSync(process.execPath, [...(existsSync(env) ? ["--env-file=.env"] : []), ...args], {
  cwd: root, stdio: "inherit", env: process.env
});
if (child.error) throw child.error;
process.exitCode = child.status ?? 1;
