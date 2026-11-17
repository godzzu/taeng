import { formatKoreanDate, formatKoreanTime, getWeddingDayState, getWeddingCountdown, toKoreanDateTime, getWeddingCalendar } from "../core/date.js";

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
  const countdown = section.querySelector('[data-field="countdown"]');
  const message = section.querySelector('[data-field="countdown-message"]');
  const fields = Object.fromEntries(["days", "hours", "minutes", "seconds"].map(unit =>
    [unit, section.querySelector('[data-field="countdown-' + unit + '"]')]));
  const enabled = info.showCountdown !== false;
  countdown.hidden = !enabled;
  let timer;
  function refresh() {
    window.clearTimeout(timer);
    const now = new Date();
    const remaining = getWeddingCountdown(weddingDate, weddingTime, now);
    const { daysRemaining } = getWeddingDayState(weddingDate, now);
    const couple = config.basic.groomName + "♥" + config.basic.brideName;
    const label = remaining.finished
      ? couple + (daysRemaining < 0 ? "의 결혼식에 함께해 주셔서 감사합니다." : "의 결혼식이 시작되었습니다.")
      : daysRemaining === 0 ? couple + "의 결혼식이 오늘입니다."
      : couple + "의 결혼식까지\n" + daysRemaining + "일 남았습니다.";
    if (message.textContent !== label) message.textContent = label;
    for (const [unit, field] of Object.entries(fields)) {
      const value = String(remaining[unit]).padStart(2, "0");
      if (field.textContent !== value) field.textContent = value;
    }
    if (info.visible && enabled && !document.hidden && !remaining.finished) {
      timer = window.setTimeout(refresh, 1000 - now.getMilliseconds());
    }
  }
  refresh();
  if (info.visible && enabled) document.addEventListener("visibilitychange", refresh);
  dispose = () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", refresh);
  };
}
