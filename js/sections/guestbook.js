export function initGuestbook(config) {
  const section = document.querySelector("#guestbook");
  if (!section) return;
  const form = section.querySelector("[data-guestbook-form]");
  const status = section.querySelector('[data-field="guestbook-status"]');

  if (!config.guestbook?.enabled) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      status.textContent = "방명록 저장 서비스가 아직 연결되지 않았습니다.";
    });
    return;
  }

  // TODO: Supabase 또는 Firebase 연동 후 등록/조회 로직을 구현합니다.
  form.addEventListener("submit", event => {
    event.preventDefault();
    status.textContent = "방명록 서비스 연결이 필요합니다.";
  });
}
