import { createServer } from "node:http";
import { readFile, realpath } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { writePublicConfig } from "./build-config.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicFolders = new Set(["assets", "config", "css", "js"]);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".mp3": "audio/mpeg", ".mp4": "video/mp4"
};

export function createDevServer() {
  return createServer(async (request, response) => {
    const sendError = (status, message) => {
      response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(request.method === "HEAD" ? undefined : message);
    };
    if (!["GET", "HEAD"].includes(request.method)) {
      response.setHeader("Allow", "GET, HEAD");
      sendError(405, "Method not allowed");
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      sendError(400, "Invalid URL");
      return;
    }
    if (pathname === "/") pathname = "/index.html";
    const segments = pathname.slice(1).split("/");
    if (/[\\\u0000:]/.test(pathname) || segments.some(part => part.startsWith(".")) ||
        (!["/index.html", "/admin.html"].includes(pathname) && !publicFolders.has(segments[0]))) {
      sendError(404, "Not found");
      return;
    }
    try {
      const [actualRoot, target] = await Promise.all([realpath(root), realpath(resolve(root, ...segments))]);
      const pathFromRoot = relative(actualRoot, target);
      if (isAbsolute(pathFromRoot) || pathFromRoot === ".." || pathFromRoot.startsWith(".." + sep)) {
        sendError(404, "Not found");
        return;
      }
      const contentType = mimeTypes[extname(target).toLowerCase()];
      if (!contentType) { sendError(404, "Not found"); return; }
      const content = await readFile(target);
      response.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": content.length,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch (error) {
      if (["ENOENT", "ENOTDIR", "EISDIR", "EACCES", "EPERM"].includes(error.code)) sendError(404, "Not found");
      else { console.error(error); sendError(500, "Unable to read file"); }
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const port = args.length === 0 ? 8000 : args.length === 2 && args[0] === "--port" ? Number(args[1]) : NaN;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("사용법: npm start -- --port 8000 (1~65535)");
    process.exitCode = 1;
  } else {
    await writePublicConfig();
    const server = createDevServer();
    server.on("error", error => {
      console.error(error.code === "EADDRINUSE"
        ? `${port}번 포트가 사용 중입니다. npm start -- --port 8001 로 실행하세요.`
        : `서버 실행 실패: ${error.message}`);
      process.exitCode = 1;
    });
    server.listen(port, "127.0.0.1", () => {
      console.log(`모바일 청첩장: http://127.0.0.1:${port}`);
      console.log("설정: config/wedding.config.js | 변경 후 브라우저 새로고침 | 종료: Ctrl+C");
    });
    for (const signal of ["SIGINT", "SIGTERM"]) {
      process.once(signal, () => { server.close(); server.closeAllConnections(); });
    }
  }
}
