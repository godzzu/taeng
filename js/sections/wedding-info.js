import { formatKoreanDate, formatKoreanTime, getWeddingDayState, millisecondsUntilKoreanMidnight, toKoreanDateTime, getWeddingCalendar } from "../core/date.js";

function renderCalendar(container, weddingDate) {
  const calendar = getWeddingCalendar(weddingDate);
  const svgNode = (tag, attrs = {}, text = "") => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    node.textContent = text;
    return node;
  };
  const svg = svgNode("svg", {
    viewBox: `0 0 280 ${100 + calendar.weeks * 36}`, role: "img",
    "aria-label": `${calendar.year}년 ${calendar.month}월 달력. ${formatKoreanDate(weddingDate)}, 결혼식 날짜 표시.`,
    focusable: "false"
  });
  svg.append(svgNode("text", { x: 140, y: 26, class: "calendar-month" }, `${calendar.year}. ${String(calendar.month).padStart(2, "0")}`));
  ["일", "월", "화", "수", "목", "금", "토"].forEach((day, i) => {
    svg.append(svgNode("text", { x: 20 + i * 40, y: 62, class: "calendar-weekday" }, day));
  });
  for (const { day, column, row } of calendar.days) {
    const x = 20 + column * 40, y = 98 + row * 36;
    const selected = day === calendar.selectedDay;
    if (selected) svg.append(svgNode("circle", { cx: x, cy: y - 5, r: 16, class: "calendar-selected" }));
    svg.append(svgNode("text", { x, y, class: selected ? "calendar-day is-wedding" : "calendar-day" }, day));
  }
  container.replaceChildren(svg);
}

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
  renderCalendar(section.querySelector('[data-field="calendar"]'), weddingDate);
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
