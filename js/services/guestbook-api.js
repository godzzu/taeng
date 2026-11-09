export const GUESTBOOK_LIMITS = Object.freeze({ name: 30, message: 300 });
export function validateGuestbookEntry({ name = "", message = "" }) {
  name = String(name).trim();
  message = String(message).replace(/\r\n?/g, "\n").trim();
  const invalid = !name || name.length > GUESTBOOK_LIMITS.name ? "name" : !message || message.length > GUESTBOOK_LIMITS.message ? "message" : null;
  return { name, message, invalid };
}
export class GuestbookError extends Error {
  constructor(code) { super(code); this.code = code; }
}
export function createGuestbookApi(settings, fetcher = globalThis.fetch) {
  let base;
  try {
    const url = new URL(settings.supabaseUrl);
    if (url.protocol === "https:" && !url.username && !url.password && url.pathname === "/") base = url.origin;
  } catch { /* The UI provides setup guidance. */ }
  const key = settings.supabasePublishableKey?.trim();
  const configured = settings.guestbookProvider === "supabase" && !!base && !!key && !key.startsWith("sb_secret_");
  async function rpc(method, body, signal) {
    if (!configured) throw new GuestbookError("not_configured");
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    const timer = setTimeout(abort, 12000);
    try {
      const response = await fetcher(base + "/rest/v1/rpc/" + method, {
        method: "POST",
        headers: { apikey: key, "Content-Type": "application/json" },
        body: JSON.stringify({ p_wedding_id: settings.guestbookWeddingId || "default", ...body }),
        signal: controller.signal
      });
      if (!response.ok) throw new GuestbookError(response.status === 429 ? "rate_limit" : "network");
      const result = await response.json();
      if (result?.error) throw new GuestbookError(result.error);
      return result;
    } catch (error) {
      if (signal?.aborted) throw new GuestbookError("aborted");
      throw error instanceof GuestbookError ? error : new GuestbookError("network");
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  }
  return {
    configured,
    async list({ before = null, signal } = {}) {
      const result = await rpc("list_guestbook", { p_before: before }, signal);
      if (!Array.isArray(result?.entries)) throw new GuestbookError("network");
      const entries = result.entries.filter(row =>
        typeof row.id === "string" && /^\d+$/.test(row.id) &&
        typeof row.name === "string" && typeof row.message === "string" &&
        Number.isFinite(Date.parse(row.created_at)));
      if (entries.length !== result.entries.length) throw new GuestbookError("network");
      return { entries, hasMore: result.has_more === true };
    },
    async create(entry, { signal } = {}) {
      const value = validateGuestbookEntry(entry);
      if (value.invalid) throw new GuestbookError(value.invalid);
      const result = await rpc("create_guestbook_entry", {
        p_name: value.name, p_message: value.message,
        p_client_id: entry.clientId, p_request_id: entry.requestId, p_website: entry.website || ""
      }, signal);
      if (typeof result?.id !== "string" || typeof result?.approved !== "boolean") throw new GuestbookError("network");
      return result;
    }
  };
}
