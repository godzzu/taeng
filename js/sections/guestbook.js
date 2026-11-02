export function initGuestbook(config) {
  const section = document.querySelector("#guestbook");
  if (!section || !config.guestbook.visible) return;
  section.querySelector("[data-guestbook-form]").addEventListener("submit", event => {
    event.preventDefault();
    section.querySelector('[data-field="guestbook-status"]').textContent = config.labels.guestUnavailable;
  });
}
