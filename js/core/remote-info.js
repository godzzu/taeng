import { createElement } from "./utils.js";

// Cache only the rendered content for this page lifecycle, not localStorage.
export function createRemoteInfoLoader(container, load, render, signal) {
  let busy = false, loaded = false;
  return async function refresh() {
    if (busy || loaded || signal.aborted) return;
    busy = true;
    const status = createElement("p", "remote-info-status", "정보를 불러오고 있습니다…");
    status.setAttribute("role", "status");
    container.replaceChildren(status);
    container.setAttribute("aria-busy", "true");
    try {
      const rows = await load(signal);
      if (signal.aborted) return;
      container.replaceChildren();
      if (rows.length) render(rows);
      else {
        status.textContent = "현재 공개된 정보가 없습니다.";
        container.append(status);
      }
      loaded = true;
    } catch (error) {
      if (signal.aborted) return;
      status.textContent = error.message === "not_configured" ? "연결 설정을 준비 중입니다."
        : error.message === "not_installed" ? "정보 제공을 준비 중입니다."
        : "정보를 불러오지 못했습니다. 다시 시도해 주세요.";
      const retry = createElement("button", "button button-small", "다시 시도");
      retry.type = "button";
      retry.addEventListener("click", refresh, { signal });
      container.replaceChildren(status, retry);
    } finally {
      busy = false;
      if (!signal.aborted) container.setAttribute("aria-busy", "false");
    }
  };
}
