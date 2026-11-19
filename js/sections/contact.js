import { createPrivateInfoApi } from "../services/private-info-api.js";
import { createRemoteInfoLoader } from "../core/remote-info.js";
import { createElement } from "../core/utils.js";

let disposeContact;
export function initContact(config, settings = {}, api = createPrivateInfoApi(settings)) {
  disposeContact?.();
  const trigger = document.querySelector("[data-contact-open]");
  const dialog = document.querySelector("[data-contact-dialog]");
  if (!trigger || !dialog) return;
  const events = new AbortController();
  const on = (node, event, handler) => node.addEventListener(event, handler, { signal: events.signal });
  const close = dialog.querySelector("[data-contact-close]");
  const list = dialog.querySelector('[data-field="contacts"]');
  const title = config.contact.title || "축하연락하기";
  trigger.textContent = title;
  trigger.hidden = !config.invitation.visible || !config.contact.visible || !config.contact.items.length;
  dialog.querySelector("[data-contact-title]").textContent = title;
  list.replaceChildren();
  let restore;
  let backdropStart = false;
  const load = createRemoteInfoLoader(list, signal => api.contacts(config.contact.items, signal), rows => {
    let previousSide;
    for (const contact of rows) {
      const row = createElement("div", "contact-dialog-row" + (previousSide && previousSide !== contact.side ? " contact-group-start" : ""));
      previousSide = contact.side;
      row.append(createElement("span", "contact-role", contact.label));
      row.append(createElement("span", "contact-person", contact.name));
      const actions = createElement("div", "contact-dialog-actions");
      for (const [protocol, label] of [["tel", config.labels.call], ["sms", config.labels.sms]]) {
        const link = createElement("a", `contact-icon contact-icon-${protocol}`);
        link.href = `${protocol}:${contact.dialNumber}`;
        const name = `${contact.label} ${contact.name} ${label}`.trim();
        link.setAttribute("aria-label", name);
        link.title = name;
        actions.append(link);
      }
      row.append(actions);
      list.append(row);
    }
  }, events.signal);
  function unlock() {
    if (!restore) return;
    const release = restore;
    restore = undefined;
    release();
  }
  function dismiss() {
    if (dialog.open) dialog.close();
    unlock();
  }
  on(trigger, "click", () => {
    if (trigger.hidden || dialog.open) return;
    const root = document.documentElement;
    const body = document.body;
    const x = window.scrollX, y = window.scrollY;
    const saved = [];
    const set = (node, name, value) => {
      saved.push([node, name, node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
      node.style.setProperty(name, value);
    };
    set(root, "overflow", "hidden");
    set(body, "position", "fixed");
    set(body, "top", `-${y}px`);
    set(body, "left", `-${x}px`);
    set(body, "width", "100%");
    restore = () => {
      for (const [node, name, value, priority] of saved) {
        if (value) node.style.setProperty(name, value, priority);
        else node.style.removeProperty(name);
      }
      const behavior = root.style.getPropertyValue("scroll-behavior");
      const priority = root.style.getPropertyPriority("scroll-behavior");
      root.style.setProperty("scroll-behavior", "auto", "important");
      trigger.focus({ preventScroll: true });
      window.scrollTo(x, y);
      if (behavior) root.style.setProperty("scroll-behavior", behavior, priority);
      else root.style.removeProperty("scroll-behavior");
    };
    try { dialog.showModal(); close.focus({ preventScroll: true }); void load(); }
    catch (error) { unlock(); throw error; }
  });
  on(close, "click", dismiss);
  on(dialog, "cancel", event => { event.preventDefault(); dismiss(); });
  on(dialog, "close", () => { if (!dialog.open) unlock(); });
  on(dialog, "pointerdown", event => { backdropStart = event.target === dialog; });
  on(dialog, "click", event => {
    if (event.target === dialog && backdropStart) dismiss();
    backdropStart = false;
  });
  disposeContact = () => { dismiss(); events.abort(); };
}
