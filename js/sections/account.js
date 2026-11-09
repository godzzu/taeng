import { showToast, createElement } from "../core/utils.js";
import { copyText } from "../services/clipboard.js";

let disposeAccount;
export function initAccount(config) {
  disposeAccount?.();
  const section = document.querySelector("#account");
  if (!section) return;
  const events = new AbortController();
  let active = true;
  disposeAccount = () => { active = false; events.abort(); };
  section.hidden = !config.account.visible || !config.account.items.length;
  section.querySelector("h2").textContent = config.account.title;
  const subtitle = section.querySelector(".eyebrow");
  subtitle.textContent = config.account.subtitle;
  subtitle.hidden = !config.account.subtitle;
  const description = section.querySelector(".section-description");
  description.textContent = config.account.description;
  description.hidden = !config.account.description;
  const list = section.querySelector('[data-field="accounts"]');
  list.replaceChildren();
  if (section.hidden) return;

  const groups = new Map();
  for (const side of ["groom", "bride", "other"]) {
    if (!config.account.items.some(account => account.side === side)) continue;
    const group = createElement("details", "account-group");
    const summary = createElement("summary", "account-group-toggle", config.account.groupTitles[side]);
    const content = createElement("div", "account-group-content");
    group.append(summary, content);
    list.append(group);
    groups.set(side, content);
  }
  config.account.items.forEach(account => {
    const card = createElement("div", "account-card");
    const header = createElement("div", "account-card-header");
    header.append(createElement("strong", "account-side", account.label));
    header.append(createElement("p", "account-holder", account.holder));
    const payment = createElement("div", "account-payment");
    const details = createElement("div", "account-details");
    details.append(createElement("p", "account-bank", account.bank));
    details.append(createElement("p", "account-number", account.number));
    const button = createElement("button", "button button-small account-copy-button");
    const copyIcon = createElement("span", "account-copy-icon");
    copyIcon.setAttribute("aria-hidden", "true");
    button.append(copyIcon);
    button.title = config.labels.copyAccount;
    button.type = "button";
    button.setAttribute("aria-label", `${account.label} ${account.holder} ${account.bank} ${config.labels.copyAccount}`);
    const fallback = createElement("div", "account-copy-fallback");
    fallback.hidden = true;
    const instruction = createElement("p", "", config.labels.accountCopyFallback);
    instruction.setAttribute("role", "status");
    const inputLabel = createElement("label", "", config.labels.accountNumber);
    const input = createElement("input", "account-copy-input");
    input.type = "text";
    input.readOnly = true;
    input.value = account.number; // Keep leading zeroes and separators exactly as configured.
    input.setAttribute("aria-label", `${account.holder} ${config.labels.accountNumber}`);
    inputLabel.append(input);
    fallback.append(instruction, inputLabel);
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await copyText(account.number);
        if (!active) return;
        button.disabled = false;
        if (document.activeElement === input) button.focus({ preventScroll: true });
        fallback.hidden = true;
        showToast(config.labels.accountCopied);
      } catch {
        if (!active) return;
        fallback.hidden = false;
        input.focus({ preventScroll: true });
        input.select();
        input.setSelectionRange(0, input.value.length);
        showToast(config.labels.copyFailed);
      } finally { if (active) button.disabled = false; }
    }, { signal: events.signal });
    payment.append(details, button);
    card.append(header, payment, fallback);
    groups.get(account.side).append(card);
  });
}
