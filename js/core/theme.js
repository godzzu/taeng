const VALID_THEMES = ["wedding-floral", "wedding-sketch"];

export function applyTheme(templateId = "wedding-floral") {
  const selected = VALID_THEMES.includes(templateId) ? templateId : "wedding-floral";
  document.documentElement.dataset.theme = selected;
  // CSS is the color source; never reinitialize sections or replace their DOM.
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.content = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-background").trim();
  }
  return selected;
}
