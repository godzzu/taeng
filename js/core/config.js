import { weddingConfig } from "../../config/wedding.config.js";
import { formatKoreanDate, formatKoreanTime } from "./date.js";

// DOM을 참조하지 않는 순수 데이터 계층. 호출마다 독립된 객체를 반환합니다.
const text = value => typeof value === "string" ? value.trim() : "";
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const visible = value => value !== false;
function url(value, image = false) {
  const input = text(value);
  if (!input || /[\\\\\u0000-\u001f]/.test(input)) return "";
  if (/^https?:\/\//i.test(input)) {
    try { return new URL(input).href; } catch { return ""; }
  }
  if (image && !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(input)) return input;
  return "";
}
function items(value, normalize) {
  return (Array.isArray(value) ? value : []).filter(item => item && typeof item === "object" && visible(item.visible)).map(normalize);
}
function image(value) {
  const data = object(value);
  return { visible: visible(data.visible), src: url(data.src, true), alt: text(data.alt) };
}
export function getWeddingConfig(source = weddingConfig) {
  const input = object(source);
  const result = { templateId: ["wedding-floral", "wedding-sketch", "wedding-ticket"].includes(input.templateId) ? input.templateId : "wedding-floral" };
  for (const key of ["hero", "invitation", "weddingInfo", "gallery", "location", "account", "contact", "guestbook", "footer", "share"]) {
    const section = object(input[key]);
    result[key] = { visible: visible(section.visible), title: text(section.title), subtitle: text(section.subtitle), description: text(section.description) };
  }
  const basic = object(input.basic);
  const date = text(basic.weddingDate);
  const time = text(basic.weddingTime);
  result.basic = {
    groomName: text(basic.groomName), brideName: text(basic.brideName), weddingDate: date, weddingTime: time,
    dateLabel: formatKoreanDate(date),
    timeLabel: formatKoreanTime(time)
  };
  result.hero.image = image(input.hero?.image);
  result.hero.linkLabel = text(input.hero?.linkLabel);
  result.invitation.message = text(input.invitation?.message);
  // Resolve the person before filtering hidden rows so names never swap sides.
  const familyRows = Array.isArray(input.invitation?.parents) ? input.invitation.parents.map((row, index) => row && ({
    ...row, person: row.person || (index === 0 ? "groom" : index === 1 ? "bride" : "")
  })) : [];
  result.invitation.parents = items(familyRows, row => ({
    ...Object.fromEntries(["label", "father", "mother", "relation"].map(key => [key, text(row[key])])),
    fatherDeceased: row.fatherDeceased === true,
    motherDeceased: row.motherDeceased === true,
    name: row.person === "groom" ? result.basic.groomName : row.person === "bride" ? result.basic.brideName : ""
  }));
  for (const key of ["venue", "hall", "address"]) result.weddingInfo[key] = text(input.weddingInfo?.[key]);
  result.weddingInfo.showDday = visible(input.weddingInfo?.showDday);
  result.gallery.items = items(input.gallery?.items, image).filter(item => item.src);
  result.gallery.visible &&= result.gallery.items.length > 0;
  const travelTitles = { car: "자차", transport: "대중교통 · 버스", subway: "지하철", parking: "주차" };
  for (const key of ["car", "transport", "subway", "parking"]) {
    const value = object(input.location?.[key]);
    result.location[key] = { visible: visible(value.visible), title: text(value.title) || travelTitles[key], text: text(value.text) };
  }
  if (input.location?.car && !result.location.car.text) {
    result.location.car.text = [result.weddingInfo.venue ? `내비게이션에서 '${result.weddingInfo.venue}'을 검색해 주세요.` : "", result.weddingInfo.address].filter(Boolean).join("\n");
  }
  const coords = object(input.location?.coordinates);
  const validCoord = (value, max) => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= max;
  result.location.coordinates = validCoord(coords.latitude, 90) && validCoord(coords.longitude, 180) ? { latitude: coords.latitude, longitude: coords.longitude } : null;
  result.location.links = items(input.location?.links, row => ({
    provider: ["kakao", "naver"].includes(row.provider) ? row.provider : "",
    label: text(row.label), url: url(row.url)
  })).filter(row => row.url || row.provider);
  result.account.groupTitles = Object.fromEntries(Object.entries({ groom: "신랑측 마음 전하는 곳", bride: "신부측 마음 전하는 곳", other: "마음 전하는 곳" }).map(([key, fallback]) => [key, text(input.account?.groupTitles?.[key]) || fallback]));
  result.account.items = items(input.account?.items, row => ({
    ...Object.fromEntries(["label", "bank", "holder", "number"].map(key => [key, text(row[key])])),
    side: ["groom", "bride", "other"].includes(row.side) ? row.side : text(row.label).includes("신랑") ? "groom" : text(row.label).includes("신부") ? "bride" : "other"
  })).filter(row => row.number);
  result.account.visible &&= result.account.items.length > 0;
  result.contact.items = items(input.contact?.items, row => ({
    label: text(row.label), name: text(row.name) || (row.person === "groom" ? result.basic.groomName : row.person === "bride" ? result.basic.brideName : ""),
    phone: text(row.phone), dialNumber: text(row.phone).replace(/[()\s.-]/g, "")
  })).filter(row => /^\+?\d{3,15}$/.test(row.dialNumber));
  result.contact.visible &&= result.contact.items.length > 0;
  result.guestbook.visible = input.guestbook?.visible === true;
  result.footer.message = text(input.footer?.message);
  result.share.title ||= `${result.basic.groomName} ♥ ${result.basic.brideName} 결혼합니다`;
  result.share.description ||= `${result.basic.dateLabel} ${result.basic.timeLabel}`;
  result.share.url = url(input.share?.url);
  result.share.image = image(input.share?.image);
  result.labels = Object.fromEntries(Object.entries(weddingConfig.labels).map(([key, value]) => [key, text(input.labels?.[key]) || value]));
  return result;
}
