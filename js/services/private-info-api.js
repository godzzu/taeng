// Public, opt-in information fetched only on demand. No persistent browser cache.
export function createPrivateInfoApi(settings = {}, fetcher = globalThis.fetch) {
  let base = "";
  try {
    const url = new URL(settings.supabaseUrl);
    if (url.protocol === "https:" && url.pathname === "/" && !url.username && !url.password) base = url.origin;
  } catch {}
  const key = settings.supabasePublishableKey?.trim();
  async function list(kind, refs, signal) {
    if (!base || !key || key.startsWith("sb_secret_")) throw Error("not_configured");
    if (!refs.length) return [];
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    const timer = setTimeout(abort, 12000);
    try {
      const response = await fetcher(`${base}/rest/v1/rpc/list_public_wedding_${kind}`, {
        method: "POST", cache: "no-store", signal: controller.signal,
        headers: { apikey: key, "Content-Type": "application/json" },
        body: JSON.stringify({ p_wedding_id: settings.guestbookWeddingId || "default", p_ids: [...new Set(refs.map(row => row.id))] })
      });
      if (!response.ok) throw Error(response.status === 404 ? "not_installed" : "network");
      const rows = await response.json();
      if (!Array.isArray(rows)) throw Error("network");
      const result = [], seen = new Set();
      for (const ref of refs) {
        if (seen.has(ref.id)) continue;
        seen.add(ref.id);
        const row = rows.find(item => item?.id === ref.id);
        if (!row) continue; // Server-hidden entries are never synthesized from local data.
        const fields = kind === "contacts" ? ["name", "label", "phone", "person"] : ["label", "bank", "holder", "account_number", "side"];
        if (fields.some(field => typeof row[field] !== "string")) throw Error("network");
        if (kind === "contacts") {
          const dialNumber = row.phone.replace(/[()\s.-]/g, "");
          if (!/^\+?\d{3,15}$/.test(dialNumber) || row.person !== ref.person) throw Error("network");
          result.push({ id: row.id, name: row.name, label: row.label, dialNumber,
            side: row.person.startsWith("groom") ? "groom" : "bride" });
        } else {
          if (!row.account_number.trim() || row.side !== ref.side) throw Error("network");
          result.push({ id: row.id, label: row.label, bank: row.bank, holder: row.holder, number: row.account_number, side: row.side });
        }
      }
      return result;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  }
  return {
    contacts: (refs, signal) => list("contacts", refs, signal),
    accounts: (refs, signal) => list("accounts", refs, signal)
  };
}
