import { formatKoreanDate, formatKoreanTime, getWeddingDayState, millisecondsUntilKoreanMidnight, toKoreanDateTime } from "../core/date.js";

let dispose;
export function initWeddingInfo(config) {
  // Reinitializing does not accumulate timers or listeners.
  dispose?.();
  const section = document.querySelector("#wedding-info");
  if (!section) return;
  const info = config.weddingInfo;
  section.hidden = !info.visible;
  section.querySelector("h2").textContent = info.title;
  const subtitle = section.querySelector(".eyebrow");
  subtitle.textContent = info.subtitle;
  subtitle.hidden = !info.subtitle;
  const { weddingDate, weddingTime } = config.basic;
  const date = section.querySelector('[data-field="date"]');
  date.textContent = formatKoreanDate(weddingDate);
  date.dateTime = weddingDate;
  const time = section.querySelector('[data-field="time"]');
  time.textContent = formatKoreanTime(weddingTime);
  time.dateTime = toKoreanDateTime(weddingDate, weddingTime);
  for (const key of ["venue", "hall", "address"]) {
    const node = section.querySelector(`[data-field="${key}"]`);
    node.textContent = info[key];
    node.hidden = !info[key];
  }
  const dday = section.querySelector('[data-field="dday"]');
  dday.hidden = !info.showDday;
  let timer;
  function refresh() {
    window.clearTimeout(timer);
    const now = new Date();
    const { daysRemaining, status } = getWeddingDayState(weddingDate, now);
    const label = status === "upcoming" ? `D-${daysRemaining}`
      : status === "today" ? config.labels.ddayToday
      : config.labels.ddayPast.replace("{days}", Math.abs(daysRemaining));
    dday.dataset.state = status;
    if (dday.textContent !== label) dday.textContent = label;
    // Date-based D-day stays "today" even after the ceremony time.
    if (info.visible && info.showDday && !document.hidden) {
      timer = window.setTimeout(refresh, millisecondsUntilKoreanMidnight(now) + 50);
    }
  }
  refresh();
  if (info.visible && info.showDday) document.addEventListener("visibilitychange", refresh);
  dispose = () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", refresh);
  };
}
