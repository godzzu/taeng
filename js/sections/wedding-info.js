import { formatKoreanDate } from "../core/utils.js";

export function initWeddingInfo(config) {
  const section = document.querySelector("#wedding-info");
  if (!section) return;
  const { weddingDate, weddingTime, dateLabel, timeLabel } = config.basic;
  section.querySelector('[data-field="date"]').textContent = dateLabel || formatKoreanDate(weddingDate);
  section.querySelector('[data-field="time"]').textContent = timeLabel || weddingTime;
  section.querySelector('[data-field="venue"]').textContent = config.weddingInfo.venue;
  section.querySelector('[data-field="hall"]').textContent = config.weddingInfo.hall;
  section.querySelector('[data-field="address"]').textContent = config.weddingInfo.address;

  const [year, month, day] = weddingDate.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.ceil((target - today) / 86400000);
  const label = diff > 0 ? `D-${diff}` : diff === 0 ? "오늘, 결혼합니다" : `결혼식이 ${Math.abs(diff)}일 지났습니다`;
  section.querySelector('[data-field="dday"]').textContent = label;
}
