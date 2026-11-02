import { createElement } from "../core/utils.js";

export function initContact(config) {
  const section = document.querySelector("#contact");
  if (!section) return;
  const list = section.querySelector('[data-field="contacts"]');
  list.replaceChildren();
  config.contact.items.forEach(contact => {
    const card = createElement("div", "contact-card");
    card.append(createElement("strong", "", `${contact.label} · ${contact.name}`));
    card.append(createElement("p", "", contact.phone));
    const actions = createElement("div", "contact-actions");
    const call = createElement("a", "button button-small button-primary", config.labels.call);
    call.href = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;
    const sms = createElement("a", "button button-small", config.labels.sms);
    sms.href = `sms:${contact.phone.replace(/[^0-9+]/g, "")}`;
    actions.append(call, sms);
    card.append(actions);
    list.append(card);
  });
}
