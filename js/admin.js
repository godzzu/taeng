import { appConfig } from "../config/app.config.js";
import { createAdminApi, guestbookCsv } from "./services/guestbook-admin-api.js";

const api = createAdminApi(appConfig);
const $ = selector => document.querySelector(selector);
const login = $("#admin-login"), status = $("#admin-status"), list = $("#entries");
let signedIn = false, busy = false, before = null, maxId = null, expires;
const dates = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" });
const errors = {
  invalid_credentials: "방명록 ID 또는 비밀번호를 확인해 주세요. 5회 연속 실패하면 15분 후 다시 시도할 수 있습니다.",
  unauthorized: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  not_installed: "관리자 기능의 데이터베이스 설정이 필요합니다. 설치 안내를 확인해 주세요.",
  not_configured: "Supabase 연결 설정이 필요합니다.",
  not_found: "이미 삭제된 글입니다. 새로고침해 주세요.",
  network: "요청을 확인하지 못했습니다. 연결을 확인한 뒤 새로고침해 주세요."
};
function element(tag, className, text) {
  const node = document.createElement(tag); node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function reset() {
  signedIn = false; api.clear(); clearTimeout(expires);
  before = maxId = null; list.replaceChildren(); $("#more").hidden = true;
  $("#manage-panel").hidden = true; $("#login-panel").hidden = false;
  $("#board-label").textContent = ""; $("#board-password").value = "";
}
async function run(work) {
  if (busy) return;
  busy = true; document.querySelectorAll("button").forEach(button => { button.disabled = true; });
  status.textContent = "처리 중입니다…";
  try { await work(); }
  catch (error) {
    if (error.code === "unauthorized") { reset(); $("#board-password").focus(); }
    status.textContent = errors[error.code] || errors.network;
  } finally {
    busy = false; document.querySelectorAll("button").forEach(button => { button.disabled = false; });
  }
}
function renderEntry(entry) {
  const card = element("article", "entry");
  const heading = element("div", "entry-heading");
  heading.append(element("h3", "", entry.name));
  const badge = element("span", "badge"); heading.append(badge);
  const time = element("time", "", dates.format(new Date(entry.created_at))); time.dateTime = entry.created_at;
  const actions = element("div", "entry-actions");
  const toggle = element("button", "secondary"), remove = element("button", "danger", "삭제");
  toggle.type = remove.type = "button";
  function update() {
    badge.textContent = entry.approved ? "공개" : "비공개";
    badge.className = "badge" + (entry.approved ? "" : " private");
    toggle.textContent = entry.approved ? "비공개로 변경" : "공개하기";
    toggle.setAttribute("aria-label", `${entry.name}님의 글 ${toggle.textContent}`);
  }
  update();
  remove.setAttribute("aria-label", `${entry.name}님의 글 삭제`);
  toggle.addEventListener("click", () => run(async () => {
    const approved = !entry.approved;
    await api.approve(entry.id, approved); entry.approved = approved; update();
    status.textContent = approved ? "청첩장에 공개했습니다." : "비공개로 변경했습니다.";
  }));
  remove.addEventListener("click", () => {
    if (!confirm(`${entry.name}님의 방명록을 삭제할까요? 삭제한 글은 복구할 수 없습니다.`)) return;
    void run(async () => {
      await api.remove(entry.id); card.remove(); $("#refresh").focus();
      status.textContent = "삭제했습니다.";
      if (!list.children.length) status.textContent += " 현재 표시된 글이 없습니다. 더 보기 또는 새로고침을 이용해 주세요.";
    });
  });
  actions.append(toggle, remove);
  card.append(heading, time, element("p", "entry-message", entry.message), actions);
  return card;
}
async function load(resetPage = false) {
  const page = await api.list(resetPage ? null : before, resetPage ? null : maxId);
  if (!signedIn) return;
  if (resetPage) list.replaceChildren();
  page.entries.forEach(entry => list.append(renderEntry(entry)));
  before = page.entries.at(-1)?.id || null; maxId = page.maxId;
  $("#more").hidden = !page.hasMore || !before;
  status.textContent = list.children.length ? `${list.children.length}개의 메시지를 표시했습니다.` : "아직 등록된 방명록이 없습니다.";
}
login.addEventListener("submit", event => {
  event.preventDefault();
  void run(async () => {
    try { await api.login($("#board-id").value, $("#board-password").value); }
    finally { $("#board-password").value = ""; }
    signedIn = true;
    $("#login-panel").hidden = true; $("#manage-panel").hidden = false;
    $("#board-label").textContent = `방명록 ID: ${$("#board-id").value.trim()}`;
    $("#manage-title").focus();
    expires = setTimeout(() => { reset(); status.textContent = errors.unauthorized; }, 7200000);
    await load(true);
  });
});
$("#refresh").addEventListener("click", () => run(() => load(true)));
$("#more").addEventListener("click", () => run(() => load()));
$("#logout").addEventListener("click", () => run(async () => {
  try { await api.logout(); status.textContent = "로그아웃했습니다."; }
  finally { reset(); $("#board-id").focus(); }
}));
$("#export").addEventListener("click", () => run(async () => {
  const entries = await api.exportAll();
  if (!signedIn) return;
  const blob = new Blob([guestbookCsv(entries)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = `guestbook-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = `${entries.length}개의 전체 메시지를 CSV 파일로 저장했습니다.`;
}));
window.addEventListener("pagehide", reset);
if (!api.configured) { status.textContent = errors.not_configured; login.querySelector("button").disabled = true; }
