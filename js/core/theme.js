const VALID_THEMES = ["wedding-floral", "wedding-sketch"];

export function applyTheme(templateId = "wedding-floral") {
  const selected = VALID_THEMES.includes(templateId) ? templateId : "wedding-floral";
  document.documentElement.dataset.theme = selected;
  return selected;
}
