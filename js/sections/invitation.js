import { createElement } from "../core/utils.js";

export function initInvitation(config) {
  const section = document.querySelector("#invitation");
  if (!section) return;
  section.querySelector("h2").textContent = config.invitation.title;
  section.querySelector('[data-field="message"]').textContent = config.invitation.message;
  const families = section.querySelector('[data-field="families"]');
  families.replaceChildren();
  [
    { title: "신랑 측", data: config.invitation.groomParents },
    { title: "신부 측", data: config.invitation.brideParents }
  ].forEach(({ title, data }) => {
    const item = createElement("div", "family-item");
    item.append(createElement("strong", "", title));
    item.append(createElement("span", "", `${data.father} · ${data.mother}`));
    item.append(createElement("p", "", data.relation));
    families.append(item);
  });
}
