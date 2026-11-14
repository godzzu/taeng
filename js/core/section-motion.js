let observer;

export function initSectionMotion() {
  observer?.disconnect();
  // Keep content visible by default, including browsers without this API.
  if (typeof IntersectionObserver === "undefined") return;
  observer = new IntersectionObserver((entries, current) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("section-fade-up");
      current.unobserve(entry.target);
    }
  // Wait until the section has entered the viewport so its entrance is visible.
  // A pixel inset also works for sections taller than the viewport.
  }, { threshold: 0, rootMargin: "0px 0px -48px 0px" });
  for (const section of document.querySelectorAll("#main-content > .section")) {
    if (section.hidden) continue;
    const content = section.querySelector(".section-inner");
    if (content && !content.classList.contains("section-fade-up")) observer.observe(content);
  }
}
