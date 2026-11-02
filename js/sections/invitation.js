import { createElement } from "../core/utils.js";
export function initInvitation(config) {
  const section = document.querySelector("#invitation");
  if (!section) return;
  section.hidden = !config.invitation.visible;
  section.querySelector("h2").textContent = config.invitation.title;
  const subtitle = section.querySelector(".eyebrow");
  subtitle.textContent = config.invitation.subtitle;
  subtitle.hidden = !config.invitation.subtitle;
  section.querySelector('[data-field="message"]').textContent = config.invitation.message;
  const families = section.querySelector('[data-field="families"]');
  families.replaceChildren();
  config.invitation.parents.forEach(data => {
    const item = createElement("li", "family-item");
    if (data.label) item.append(createElement("span", "family-label", data.label));
    const parents = [data.father, data.mother].filter(Boolean).join(" · ");
    if (parents) item.append(createElement("strong", "family-parents", parents));
    if (data.relation) item.append(createElement("p", "family-relation", data.relation));
    families.append(item);
  });
  families.hidden = !config.invitation.parents.length;
}
