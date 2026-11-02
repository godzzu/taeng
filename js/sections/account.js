import { showToast, createElement } from "../core/utils.js";

export function initAccount(config) {
  const section = document.querySelector("#account");
  if (!section) return;
  const list = section.querySelector('[data-field="accounts"]');
  list.replaceChildren();
  if (!config.account.visible) {
  section.hidden = true;
  return;
  }

  config.account.items.forEach(account => {
    const card = createElement("div", "account-card");
    const details = createElement("div");
    details.append(createElement("strong", "", `${account.label} · ${account.holder}`));
    details.append(createElement("p", "", `${account.bank} ${account.number}`));
    const button = createElement("button", "button button-small", config.labels.copyAccount);
    button.type = "button";
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(account.number);
        showToast(config.labels.accountCopied);
      } catch {
        showToast(config.labels.copyFailed);
      }
    });
    card.append(details, button);
    list.append(card);
  });
}
