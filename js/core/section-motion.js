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
  }, { threshold: 0 });
  for (const id of ["account", "contact", "guestbook"]) {
    const section = document.getElementById(id);
    if (!section || section.hidden) continue;
    const content = section.querySelector(".section-inner");
    if (content && !content.classList.contains("section-fade-up")) observer.observe(content);
  }
}
