// All calendar boundaries use Korea time, regardless of the visitor's timezone.
export const WEDDING_TIME_ZONE = "Asia/Seoul";
const DAY_MS = 86_400_000;
const koreaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: WEDDING_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit"
});

function parseDate(value) {
  const date = new Date(value + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new TypeError("basic.weddingDate는 유효한 YYYY-MM-DD 날짜여야 합니다.");
  }
  return date;
}

function parseTime(value) {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new TypeError("basic.weddingTime은 HH:mm 형식이어야 합니다.");
  }
  return value.split(":").map(Number);
}

export function formatKoreanDate(value) {
  // Noon KST keeps the configured calendar date explicit.
  parseDate(value);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: WEDDING_TIME_ZONE, year: "numeric", month: "long", day: "numeric", weekday: "long"
  }).format(new Date(value + "T12:00:00+09:00"));
}

export function formatKoreanTime(value) {
  const [hour, minute] = parseTime(value);
  return `${hour < 12 ? "오전" : "오후"} ${hour % 12 || 12}시${minute ? " " + minute + "분" : ""}`;
}

export function getKoreanDate(now = new Date()) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError("유효한 현재 시각이 필요합니다.");
  const parts = Object.fromEntries(koreaDate.formatToParts(now).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getWeddingDayState(weddingDate, now = new Date()) {
  const target = parseDate(weddingDate).getTime();
  const today = parseDate(getKoreanDate(now)).getTime();
  const daysRemaining = Math.round((target - today) / DAY_MS);
  return { daysRemaining, status: daysRemaining > 0 ? "upcoming" : daysRemaining === 0 ? "today" : "past" };
}

export function millisecondsUntilKoreanMidnight(now = new Date()) {
  const midnight = new Date(getKoreanDate(now) + "T00:00:00+09:00").getTime();
  return midnight + DAY_MS - now.getTime();
}

export function toKoreanDateTime(date, time) {
  parseDate(date);
  parseTime(time);
  return `${date}T${time}:00+09:00`;
}

// Read the configured Korean calendar date without visitor-local timezone shifts.
export function getWeddingCalendar(value) {
  const date = parseDate(value);
  const year = date.getUTCFullYear(), month = date.getUTCMonth() + 1;
  const first = new Date(date);
  first.setUTCDate(1);
  const last = new Date(first);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  const offset = first.getUTCDay(), count = last.getUTCDate();
  return { year, month, selectedDay: date.getUTCDate(),
    weeks: Math.ceil((offset + count) / 7),
    days: Array.from({ length: count }, (_, i) => ({ day: i + 1, column: (offset + i) % 7, row: Math.floor((offset + i) / 7) })) };
}
