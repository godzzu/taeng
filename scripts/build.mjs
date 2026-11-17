import { cp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { publicConfig, writePublicConfig } from "./build-config.mjs";
import { renderShareMetadata } from "./build-share-meta.mjs";
import { getWeddingConfig } from "../js/core/config.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "dist");
publicConfig(); // Validate before replacing the previous build.
// Fixed workspace-local build directory, never a path supplied by configuration.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const folder of ["assets", "css", "js"]) await cp(join(root, folder), join(output, folder), { recursive: true });
await mkdir(join(output, "config"));
for (const file of ["app.config.js", "wedding.config.js"]) await cp(join(root, "config", file), join(output, "config", file));
await writePublicConfig(join(output, "config/public-env.js"));
await cp(join(root, "admin.html"), join(output, "admin.html"));
const html = await readFile(join(root, "index.html"), "utf8");
await writeFile(join(output, "index.html"), renderShareMetadata(html, getWeddingConfig()));
await writeFile(join(output, ".nojekyll"), "");
console.log("Static site built in dist/ (no .env or server files).");
