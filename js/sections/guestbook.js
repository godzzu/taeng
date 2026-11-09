import { createGuestbookApi, validateGuestbookEntry, GUESTBOOK_LIMITS } from "../services/guestbook-api.js";
import { createElement } from "../core/utils.js";

let disposeGuestbook;
export function initGuestbook(config, settings = {}) {
  disposeGuestbook?.();
  const section = document.querySelector("#guestbook");
  if (!section) return;
  section.hidden = !config.guestbook.visible;
  if (section.hidden) return;
  const lifecycle = new AbortController();
  let active = true, saving = false, loading = false, refreshQueued = false, before = null, hasMore = false, attempt;
  disposeGuestbook = () => { active = false; lifecycle.abort(); };
  const labels = config.labels;
  const api = createGuestbookApi(settings);
  const form = section.querySelector("[data-guestbook-form]");
  const name = form.elements.namedItem("name"), message = form.elements.namedItem("message");
  name.readOnly = message.readOnly = false;
  name.maxLength = GUESTBOOK_LIMITS.name;
  message.maxLength = GUESTBOOK_LIMITS.message;
  const submit = form.querySelector('button[type="submit"]');
  const status = section.querySelector('[data-field="guestbook-status"]');
  const list = section.querySelector('[data-field="guestbook-list"]');
  const listStatus = section.querySelector("[data-guestbook-list-status]");
  const more = section.querySelector("[data-guestbook-more]");
  const seen = new Set();
  section.querySelector("h2").textContent = config.guestbook.title;
  section.querySelector(".eyebrow").textContent = config.guestbook.subtitle;
  section.querySelector(".section-description").textContent = config.guestbook.description;
  list.replaceChildren();
  const on = (node, event, fn) => node.addEventListener(event, fn, { signal: lifecycle.signal });
  const count = () => {
    section.querySelector("[data-name-count]").textContent = `${name.value.length} / ${GUESTBOOK_LIMITS.name}`;
    section.querySelector("[data-message-count]").textContent = `${message.value.length} / ${GUESTBOOK_LIMITS.message}`;
  };
  for (const input of [name, message]) on(input, "input", () => {
    input.setCustomValidity(""); input.removeAttribute("aria-invalid"); count();
  });
  count();
  submit.disabled = !api.configured;
  name.disabled = message.disabled = !api.configured;
  status.textContent = api.configured ? "" : labels.guestUnavailable;
  more.hidden = true;
  if (!api.configured) return;

  let clientId;
  try { clientId = localStorage.getItem("wedding-guestbook-client"); } catch {}
  if (!/^[0-9a-f-]{36}$/i.test(clientId || "")) {
    clientId = crypto.randomUUID();
    try { localStorage.setItem("wedding-guestbook-client", clientId); } catch {}
  }
  const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit"
  });
  function appendEntries(entries) {
    for (const entry of entries) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      const card = createElement("article", "guestbook-card");
      const author = createElement("h3", "", entry.name);
      const time = createElement("time", "guestbook-date", dateFormatter.format(new Date(entry.created_at)));
      time.dateTime = entry.created_at;
      const body = createElement("p", "guestbook-message", entry.message);
      card.append(author, time, body);
      list.append(card);
    }
  }
  async function load(reset = false) {
    if (loading) { if (reset) refreshQueued = true; return; }
    loading = true; more.disabled = true;
    listStatus.textContent = labels.guestLoading;
    try {
      const page = await api.list({ before: reset ? null : before, signal: lifecycle.signal });
      if (!active) return;
      if (reset) { list.replaceChildren(); seen.clear(); }
      appendEntries(page.entries);
      before = page.entries.at(-1)?.id || null;
      hasMore = page.hasMore && !!before;
      listStatus.textContent = seen.size ? "" : labels.guestEmpty;
      more.textContent = labels.guestMore; more.hidden = !hasMore;
      more.dataset.retry = "";
    } catch {
      if (!active) return;
      listStatus.textContent = labels.guestLoadError;
      more.hidden = false; more.textContent = labels.guestRetry;
      more.dataset.retry = reset ? "reset" : "page";
    } finally {
      loading = false;
      if (active) {
        more.disabled = false;
        if (refreshQueued) { refreshQueued = false; void load(true); }
      }
    }
  }
  on(more, "click", () => load(more.dataset.retry === "reset"));
  on(form, "submit", async event => {
    event.preventDefault();
    if (saving) return;
    const value = validateGuestbookEntry({ name: name.value, message: message.value });
    if (value.invalid) {
      const input = value.invalid === "name" ? name : message;
      const warning = value.invalid === "name" ? labels.guestNameInvalid : labels.guestMessageInvalid;
      input.setCustomValidity(warning); input.setAttribute("aria-invalid", "true");
      status.textContent = warning; input.reportValidity(); input.focus(); return;
    }
    if (!form.reportValidity()) return;
    const fingerprint = JSON.stringify([value.name, value.message]);
    if (attempt?.fingerprint !== fingerprint) attempt = { fingerprint, id: crypto.randomUUID() };
    saving = true; submit.disabled = true; name.readOnly = message.readOnly = true;
    status.textContent = labels.guestSaving;
    try {
      const result = await api.create({
        ...value, requestId: attempt.id, clientId, website: form.elements.namedItem("website").value
      }, { signal: lifecycle.signal });
      if (!active) return;
      form.reset(); count(); attempt = null;
      status.textContent = result.approved ? labels.guestSaved : labels.guestPending;
      if (result.approved) await load(true);
    } catch (error) {
      if (!active) return;
      const errors = { name: labels.guestNameInvalid, message: labels.guestMessageInvalid,
        rate_limit: labels.guestRateLimit, duplicate: labels.guestDuplicate, closed: labels.guestClosed,
        not_configured: labels.guestUnavailable };
      status.textContent = errors[error.code] || labels.guestError;
    } finally {
      saving = false;
      if (active) { submit.disabled = false; name.readOnly = message.readOnly = false; }
    }
  });
  void load(true);
}
