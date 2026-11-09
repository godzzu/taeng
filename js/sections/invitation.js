import { createElement } from "../core/utils.js";
export function initInvitation(config) {
  const section = document.querySelector("#invitation");
  if (!section) return;
  section.hidden = !config.invitation.visible;
  section.querySelector("h2").textContent = config.invitation.title;
  const subtitle = section.querySelector(".eyebrow");
  subtitle.textContent = config.invitation.subtitle;
  subtitle.hidden = !config.invitation.subtitle;
  const message = section.querySelector('[data-field="message"]');
  message.textContent = config.invitation.message;
  message.hidden = !config.invitation.message.trim();
  const families = section.querySelector('[data-field="families"]');
  families.replaceChildren();
  config.invitation.parents.forEach(data => {
    const parents = [[data.father, data.fatherDeceased], [data.mother, data.motherDeceased]].filter(([name]) => name);
    if (!parents.length && !data.relation && !data.name) return;
    const item = createElement("li", "family-item");
    if (data.label) item.append(createElement("span", "family-label", data.label));
    if (parents.length) {
      const names = createElement("strong", "family-parents");
      parents.forEach(([name, deceased], index) => {
        if (index) names.append(createElement("span", "family-separator", " · "));
        const person = createElement("span", "family-person");
        if (deceased) {
          const flower = createElement("span", "memorial-flower");
          flower.setAttribute("role", "img");
          flower.setAttribute("aria-label", "고인");
          person.append(flower);
        }
        person.append(createElement("span", "family-person-name", name));
        names.append(person);
      });
      item.append(names);
    }
    const relation = [data.relation, data.name].filter(Boolean).join(" ");
    if (relation) item.append(createElement("p", "family-relation", relation));
    families.append(item);
  });
  families.hidden = !families.children.length;
}
