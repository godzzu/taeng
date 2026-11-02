export function initGallery(config) {
  const section = document.querySelector("#gallery");
  const dialog = document.querySelector("[data-gallery-dialog]");
  if (!section || !dialog) return;

  const grid = section.querySelector('[data-field="gallery"]');
  const image = dialog.querySelector("[data-dialog-image]");
  const counter = dialog.querySelector("[data-dialog-counter]");
  const items = config.gallery || [];
  let current = 0;
  let touchStartX = 0;

  grid.replaceChildren();
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "gallery-item";
    button.type = "button";
    button.setAttribute("aria-label", `${index + 1}번 사진 크게 보기`);
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || "";
    img.loading = "lazy";
    button.append(img);
    button.addEventListener("click", () => openAt(index));
    grid.append(button);
  });

  function render() {
    const item = items[current];
    if (!item) return;
    image.src = item.src;
    image.alt = item.alt || "";
    counter.textContent = `${current + 1} / ${items.length}`;
  }
  function openAt(index) {
    if (!items.length) return;
    current = index;
    render();
    dialog.showModal();
  }
  function move(step) {
    current = (current + step + items.length) % items.length;
    render();
  }

  dialog.querySelector("[data-dialog-close]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-dialog-prev]").addEventListener("click", () => move(-1));
  dialog.querySelector("[data-dialog-next]").addEventListener("click", () => move(1));
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  dialog.addEventListener("touchend", event => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
  }, { passive: true });
}
