import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../js/core/date.js", import.meta.url), "utf8");
const dateUrl = "data:text/javascript;base64," + Buffer.from(source).toString("base64");
const { getWeddingDayState, getKoreanDate, formatKoreanDate, formatKoreanTime, toKoreanDateTime, getWeddingCalendar, getWeddingCountdown } = await import(dateUrl);
const originalTimezone = process.env.TZ;
try {
  for (const timezone of ["UTC", "America/Los_Angeles", "Asia/Seoul"]) {
    process.env.TZ = timezone;
    assert.equal(getKoreanDate(new Date("2027-05-14T14:59:59.999Z")), "2027-05-14");
    assert.deepEqual(getWeddingDayState("2027-05-15", new Date("2027-05-14T14:59:59.999Z")), { daysRemaining: 1, status: "upcoming" });
    assert.deepEqual(getWeddingDayState("2027-05-15", new Date("2027-05-14T15:00:00Z")), { daysRemaining: 0, status: "today" });
    assert.equal(getWeddingDayState("2027-05-15", new Date("2027-05-15T14:59:59Z")).status, "today");
    assert.deepEqual(getWeddingDayState("2027-05-15", new Date("2027-05-15T15:00:00Z")), { daysRemaining: -1, status: "past" });
    assert.equal(getWeddingDayState("2028-03-01", new Date("2028-02-28T15:00:00Z")).daysRemaining, 1);
    assert.equal(getWeddingDayState("2028-01-01", new Date("2027-12-30T15:00:00Z")).daysRemaining, 1);
    assert.equal(getWeddingDayState("2027-03-15", new Date("2027-03-13T15:00:00Z")).daysRemaining, 1);
    assert.match(formatKoreanDate("2027-05-15"), /토요일/);
    const may = getWeddingCalendar("2027-05-15");
    assert.equal(may.days[14].column, 6);
    assert.equal(may.selectedDay, 15);
    assert.equal(may.weeks, 6);
    assert.equal(getWeddingCalendar("2028-02-29").days.length, 29);
    assert.equal(getWeddingCalendar("2027-02-01").days.length, 28);
    assert.equal(getWeddingCalendar("2028-12-31").month, 12);
  }
} finally {
  if (originalTimezone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimezone;
}
assert.equal(formatKoreanTime("00:00"), "오전 12시");
assert.equal(formatKoreanTime("12:00"), "오후 12시");
assert.equal(formatKoreanTime("23:05"), "오후 11시 5분");
assert.equal(toKoreanDateTime("2027-05-15", "12:30"), "2027-05-15T12:30:00+09:00");
for (const date of ["2027-02-29", "2027-04-31", "invalid"]) assert.throws(() => formatKoreanDate(date));
for (const time of ["24:00", "12:60", "9:00"]) assert.throws(() => formatKoreanTime(time));
assert.throws(() => getKoreanDate(new Date("invalid")));
console.log("PASS: Korea midnight, today/past, leap day, year boundary, DST independence, time formatting and validation");

// Rendering and timer lifecycle without a browser dependency.
const nodes = new Map();
const makeNode = () => ({ textContent: "", dataset: {}, hidden: false, children: [], attributes: {},
  setAttribute(key, value) { this.attributes[key] = value; },
  append(...nodes) { this.children.push(...nodes); },
  replaceChildren(...nodes) { this.children = nodes; }
});
const section = {
  querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, makeNode());
    return nodes.get(selector);
  }
};
const listeners = new Set(), timers = new Map();
let timerId = 0;
globalThis.document = {
  hidden: false, querySelector: () => section,
  createElementNS: () => makeNode(),
  addEventListener: (event, callback) => listeners.add(callback),
  removeEventListener: (event, callback) => listeners.delete(callback)
};
globalThis.window = {
  setTimeout: (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; },
  clearTimeout: id => timers.delete(id)
};
const renderSource = await readFile(new URL("../js/sections/wedding-info.js", import.meta.url), "utf8");
const { initWeddingInfo } = await import("data:text/javascript;base64," + Buffer.from(renderSource.replace('"../core/date.js"', JSON.stringify(dateUrl))).toString("base64"));
const config = {
  basic: { groomName: "홍길동", brideName: "김하나", weddingDate: "2099-05-15", weddingTime: "12:30" },
  weddingInfo: { visible: true, showCountdown: true, title: "약속의 날", subtitle: "WEDDING DAY", venue: "예식장", hall: "", address: "서울\n2층" },
};
initWeddingInfo(config);
assert.equal(section.querySelector('[data-field="countdown-message"]').textContent, '홍길동♥김하나의 결혼식까지\n' + getWeddingDayState(config.basic.weddingDate).daysRemaining + '일 남았습니다.');
assert(!nodes.has('[data-field="hall"]'));
assert(!nodes.has('[data-field="address"]'));
const calendarSvg = section.querySelector('[data-field="calendar"]').children[0];
assert.equal(calendarSvg.attributes.role, "img");
assert.equal(calendarSvg.children.filter(n => n.attributes.class === "calendar-selected").length, 1);
assert.equal(timers.size, 1);
assert.equal(listeners.size, 1);
initWeddingInfo(config);
assert.equal(timers.size, 1);
assert.equal(section.querySelector('[data-field="calendar"]').children.length, 1);
assert.equal(listeners.size, 1);
document.hidden = true;
[...listeners][0]();
assert.equal(timers.size, 0);
document.hidden = false;
[...listeners][0]();
assert.equal(timers.size, 1);
config.weddingInfo.showCountdown = false;
initWeddingInfo(config);
assert(section.querySelector('[data-field="countdown"]').hidden);
assert.equal(timers.size, 0);
assert.equal(listeners.size, 0);
console.log("PASS: section content, optional fields, live refresh, background/resume and timer cleanup");

for (const timezone of ["UTC", "America/Los_Angeles", "Asia/Seoul"]) {
  process.env.TZ = timezone;
  assert.deepEqual(getWeddingCountdown("2027-05-15", "12:30", new Date("2027-05-14T03:29:59Z")), { days: 1, hours: 0, minutes: 0, seconds: 1, finished: false });
  assert.deepEqual(getWeddingCountdown("2027-05-15", "12:30", new Date("2027-05-15T03:30:00Z")), { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
  assert.equal(getWeddingCountdown("2027-05-15", "12:30", new Date("2027-05-16T00:00:00Z")).days, 0);
}
if (originalTimezone === undefined) delete process.env.TZ; else process.env.TZ = originalTimezone;
config.weddingInfo.showCountdown = true;
config.basic.weddingDate = "2000-01-01";
initWeddingInfo(config);
assert.equal(timers.size, 0);
assert.equal(section.querySelector('[data-field="countdown-seconds"]').textContent, '00');
assert.match(section.querySelector('[data-field="countdown-message"]').textContent, /감사합니다/);
console.log('PASS: countdown Korea-time instant, rollover, completion and past-date timer stop');
