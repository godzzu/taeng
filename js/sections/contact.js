import { createElement } from "../core/utils.js";

export function initContact(config) {
  const section = document.querySelector("#contact");
  if (!section) return;
  section.hidden = !config.contact.visible || !config.contact.items.length;
  section.querySelector("h2").textContent = config.contact.title;
  const subtitle = section.querySelector(".eyebrow");
  subtitle.textContent = config.contact.subtitle;
  subtitle.hidden = !config.contact.subtitle;
  const list = section.querySelector('[data-field="contacts"]');
  list.replaceChildren();
  if (section.hidden) return;
  config.contact.items.forEach(contact => {
    const card = createElement("div", "contact-card");
    card.append(createElement("strong", "contact-name", [contact.label, contact.name].filter(Boolean).join(" · ")));
    card.append(createElement("p", "contact-phone", contact.phone));
    const actions = createElement("div", "contact-actions");
    for (const [protocol, label, primary] of [["tel", config.labels.call, true], ["sms", config.labels.sms, false]]) {
      const link = createElement("a", "button button-small" + (primary ? " button-primary" : ""), label);
      link.href = `${protocol}:${contact.dialNumber}`;
      link.setAttribute("aria-label", `${contact.label} ${contact.name} ${label}`.trim());
      actions.append(link);
    }
    card.append(actions);
    list.append(card);
  });
}
