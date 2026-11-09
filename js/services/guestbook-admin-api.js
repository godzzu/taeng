export class AdminError extends Error {
  constructor(code) { super(code); this.code = code; }
}
export function createAdminApi(settings, fetcher = globalThis.fetch) {
  let base = "", token = "", board = "";
  try {
    const url = new URL(settings.supabaseUrl);
    if (url.protocol === "https:" && url.pathname === "/" && !url.username && !url.password) base = url.origin;
  } catch { /* Report setup error in the UI. */ }
  const key = settings.supabasePublishableKey?.trim();
  const configured = settings.guestbookProvider === "supabase" && !!base && !!key && !key.startsWith("sb_secret_");
  async function rpc(action, data = {}) {
    if (!configured) throw new AdminError("not_configured");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetcher(`${base}/rest/v1/rpc/guestbook_admin`, {
        method: "POST", headers: { apikey: key, "Content-Type": "application/json" },
        body: JSON.stringify({ p_action: action, p_wedding_id: board, p_token: token || null, ...data }),
        signal: controller.signal, cache: "no-store"
      });
      if (!response.ok) throw new AdminError(response.status === 404 ? "not_installed" : "network");
      const result = await response.json();
      if (result?.error) throw new AdminError(result.error);
      return result;
    } catch (error) {
      throw error instanceof AdminError ? error : new AdminError("network");
    } finally { clearTimeout(timer); }
  }
  const api = {
    configured,
    clear() { token = ""; board = ""; },
    async login(id, password) {
      api.clear();
      const result = await rpc("login", { p_wedding_id: id.trim(), p_password: password });
      if (!/^[a-f0-9]{64}$/.test(result?.token)) throw new AdminError("network");
      token = result.token; board = id.trim();
    },
    async logout() { try { await rpc("logout"); } finally { api.clear(); } },
    async list(before = null, maxId = null) {
      const result = await rpc("list", { p_before: before, p_max_id: maxId });
      if (!Array.isArray(result?.entries) || !/^\d+$/.test(result.max_id) || result.entries.some(row =>
        typeof row.id !== "string" || !/^\d+$/.test(row.id) || typeof row.name !== "string" ||
        typeof row.message !== "string" || typeof row.approved !== "boolean" || !Number.isFinite(Date.parse(row.created_at)))) throw new AdminError("network");
      return { entries: result.entries, hasMore: result.has_more === true, maxId: result.max_id };
    },
    async approve(id, approved) { const result = await rpc("set_approval", { p_entry_id: id, p_approved: approved }); if (result?.ok !== true) throw new AdminError("network"); },
    async remove(id) { const result = await rpc("delete", { p_entry_id: id }); if (result?.ok !== true) throw new AdminError("network"); },
    async exportAll() {
      const rows = []; let before = null, max = null;
      do {
        const page = await api.list(before, max); max = page.maxId;
        rows.push(...page.entries);
        if (!page.hasMore) return rows;
        const next = page.entries.at(-1)?.id;
        if (!next || (before && BigInt(next) >= BigInt(before))) throw new AdminError("network");
        before = next;
      } while (true);
    }
  };
  return api;
}

// Quote every field and neutralize spreadsheet formulas in untrusted input.
export function guestbookCsv(entries) {
  const cell = value => {
    let text = String(value ?? "");
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const rows = [["번호", "작성자", "축하 메시지", "공개 여부", "작성일(한국 시간)"], ...entries.map(row => [
    row.id, row.name, row.message, row.approved ? "공개" : "비공개",
    new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", dateStyle: "short", timeStyle: "medium" }).format(new Date(row.created_at))
  ])];
  return "\uFEFF" + rows.map(row => row.map(cell).join(",")).join("\r\n");
}
