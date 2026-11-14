import { createElement } from "./utils.js";

export function initFamilySlideshow(photo, fallback, images) {
  let active = -1, timer, disposed = false;
  const motion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
  const slides = [];
  const ready = () => slides.filter(slide => slide.loaded && !slide.failed);
  function show(index) {
    active = index;
    slides.forEach((slide, i) => {
      slide.img.setAttribute("data-active", String(i === index));
      slide.img.setAttribute("aria-hidden", String(i !== index));
    });
    fallback.hidden = index >= 0;
  }
  function schedule() {
    clearInterval(timer);
    const multiple = ready().length > 1;
    if (disposed || !multiple || motion?.matches || document.hidden) return;
    timer = setInterval(() => {
      const next = slides.findIndex((slide, i) => i > active && slide.loaded && !slide.failed);
      show(next >= 0 ? next : slides.findIndex(slide => slide.loaded && !slide.failed));
    }, 5000);
  }
  for (const data of images) {
    const img = createElement("img", "family-photo-image");
    const slide = { img, loaded: false, failed: false };
    const index = slides.length;
    slides.push(slide);
    img.alt = data.alt || fallback.textContent;
    img.loading = "lazy"; img.decoding = "async";
    img.width = 300; img.height = 400;
    img.setAttribute("data-active", String(index === 0));
    img.setAttribute("aria-hidden", String(index !== 0));
    if (index === 0) { active = 0; fallback.hidden = true; }
    img.onload = () => {
      if (disposed) return;
      slide.loaded = true;
      if (active < 0) show(index);
      schedule();
    };
    img.onerror = () => {
      if (disposed) return;
      slide.failed = true; img.hidden = true;
      if (active === index) show(slides.findIndex(s => s.loaded && !s.failed));
      schedule();
    };
    img.src = data.src;
    photo.append(img);
  }
  document.addEventListener?.("visibilitychange", schedule);
  motion?.addEventListener("change", schedule);
  return () => {
    disposed = true; clearInterval(timer);
    document.removeEventListener?.("visibilitychange", schedule);
    motion?.removeEventListener("change", schedule);
    slides.forEach(({ img }) => { img.onload = img.onerror = null; });
  };
}
