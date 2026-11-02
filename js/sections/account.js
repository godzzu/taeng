import { showToast, createElement } from "../core/utils.js";

export function initAccount(config) {
  const section = document.querySelector("#account");
  if (!section) return;
  const list = section.querySelector('[data-field="accounts"]');
  list.replaceChildren();
  if (!config.account.enabled) {
    section.hidden = true;
    return;
  }

  [["신랑 측", config.account.groom], ["신부 측", config.account.bride]].forEach(([group, accounts]) => {
    (accounts || []).forEach(account => {
      const card = createElement("div", "account-card");
      const details = createElement("div");
      details.append(createElement("strong", "", `${group} · ${account.holder}`));
      details.append(createElement("p", "", `${account.bank} ${account.number}`));
      const button = createElement("button", "button button-small", "계좌번호 복사");
      button.type = "button";
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(account.number);
          showToast("계좌번호가 복사되었습니다.");
        } catch {
          showToast("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
        }
      });
      card.append(details, button);
      list.append(card);
    });
  });
}
