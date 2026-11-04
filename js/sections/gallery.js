let disposeGallery;

export function initGallery(config) {
  disposeGallery?.();
  const section = document.querySelector("#gallery");
  const dialog = document.querySelector("[data-gallery-dialog]");
  if (!section || !dialog) return;

  const events = new AbortController();
  const on = (node, name, handler, options = {}) =>
    node.addEventListener(name, handler, { ...options, signal: events.signal });
  const grid = section.querySelector('[data-field="gallery"]');
  const stage = dialog.querySelector("[data-dialog-stage]");
  let image = dialog.querySelector("[data-dialog-image]");
  const status = dialog.querySelector("[data-dialog-status]");
  const retry = dialog.querySelector("[data-dialog-retry]");
  const counter = dialog.querySelector("[data-dialog-counter]");
  const close = dialog.querySelector("[data-dialog-close]");
  const prev = dialog.querySelector("[data-dialog-prev]");
  const next = dialog.querySelector("[data-dialog-next]");
  const items = config.gallery.items;
  const labels = config.labels;
  let current = 0;
  let trigger;
  let unlock;
  let touch;
  let backdropStart = false;
  let revision = 0;

  section.hidden = !config.gallery.visible || !items.length;
  section.querySelector("h2").textContent = config.gallery.title;
  const subtitle = section.querySelector(".eyebrow");
  subtitle.textContent = config.gallery.subtitle;
  subtitle.hidden = !config.gallery.subtitle;
  dialog.setAttribute("aria-label", labels.galleryDialog);
  close.setAttribute("aria-label", labels.galleryClose);
  prev.setAttribute("aria-label", labels.galleryPrev);
  next.setAttribute("aria-label", labels.galleryNext);
  retry.textContent = labels.galleryRetry;
  prev.hidden = next.hidden = items.length < 2;

  grid.replaceChildren();
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "gallery-item";
    button.type = "button";
    button.setAttribute("aria-label", labels.galleryOpen.replace("{number}", index + 1) + (item.alt ? ": " + item.alt : ""));
    button.setAttribute("aria-haspopup", "dialog");
    const img = document.createElement("img");
    img.alt = item.alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    const fallback = document.createElement("span");
    fallback.className = "gallery-fallback";
    fallback.textContent = labels.galleryThumbnailError;
    fallback.hidden = true;
    on(img, "error", () => { img.hidden = true; fallback.hidden = false; });
    img.src = item.src;
    button.append(img, fallback);
    on(button, "click", () => openAt(index, button));
    grid.append(button);
  });

  function render() {
    const item = items[current];
    if (!item) return;
    const request = ++revision;
    // Each request owns its image node, so a late error cannot replace a newer photo.
    const replacement = document.createElement("img");
    replacement.setAttribute("data-dialog-image", "");
    replacement.alt = item.alt || "";
    replacement.decoding = "async";
    replacement.hidden = true;
    image.replaceWith(replacement);
    image = replacement;
    status.textContent = labels.galleryLoading;
    stage.setAttribute("aria-busy", "true");
    if (document.activeElement === retry) close.focus({ preventScroll: true });
    retry.hidden = true;
    counter.textContent = `${current + 1} / ${items.length}`;
    replacement.onload = () => {
      if (request !== revision) return;
      stage.setAttribute("aria-busy", "false");
      replacement.hidden = false;
      status.textContent = "";
    };
    replacement.onerror = () => {
      if (request !== revision) return;
      stage.setAttribute("aria-busy", "false");
      replacement.hidden = true;
      status.textContent = labels.galleryError;
      retry.hidden = false;
    };
    replacement.src = item.src;
  }

  function lockScroll() {
    const x = window.scrollX, y = window.scrollY;
    const root = document.documentElement, body = document.body;
    const saved = [];
    const set = (node, name, value) => {
      saved.push([node, name, node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
      node.style.setProperty(name, value);
    };
    const gutter = window.innerWidth - root.clientWidth;
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    set(root, "overflow", "hidden");
    set(body, "position", "fixed");
    set(body, "top", `-${y}px`);
    set(body, "left", `-${x}px`);
    set(body, "width", "100%");
    if (gutter > 0) set(body, "padding-right", `${padding + gutter}px`);
    return () => {
      for (const [node, name, value, priority] of saved) {
        if (value) node.style.setProperty(name, value, priority);
        else node.style.removeProperty(name);
      }
      const behavior = root.style.getPropertyValue("scroll-behavior");
      const priority = root.style.getPropertyPriority("scroll-behavior");
      root.style.setProperty("scroll-behavior", "auto", "important");
      trigger?.focus({ preventScroll: true });
      window.scrollTo(x, y);
      if (behavior) root.style.setProperty("scroll-behavior", behavior, priority);
      else root.style.removeProperty("scroll-behavior");
    };
  }
  function restore() {
    if (!unlock) return;
    unlock();
    unlock = undefined;
    touch = undefined;
    revision++;
  }
  function closeDialog() {
    if (dialog.open) dialog.close();
    restore();
  }
  function openAt(index, button) {
    if (!items.length || dialog.open) return;
    current = index;
    trigger = button;
    unlock = lockScroll();
    try {
      dialog.showModal(); // Native dialog traps focus and makes the page inert.
    } catch (error) {
      restore();
      throw error;
    }
    render();
    close.focus({ preventScroll: true });
  }
  function move(step) {
    if (!dialog.open || items.length < 2) return;
    current = (current + step + items.length) % items.length;
    render();
  }
  on(close, "click", closeDialog);
  on(prev, "click", () => move(-1));
  on(next, "click", () => move(1));
  on(retry, "click", render);
  on(dialog, "cancel", event => { event.preventDefault(); closeDialog(); });
  on(dialog, "close", () => { if (!dialog.open) restore(); });
  on(dialog, "keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  on(dialog, "pointerdown", event => { backdropStart = event.target === dialog; });
  on(dialog, "click", event => {
    if (event.target === dialog && backdropStart) closeDialog();
    backdropStart = false;
  });
  on(stage, "touchstart", event => {
    touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY, id: event.touches[0].identifier } : undefined;
  }, { passive: true });
  on(stage, "touchmove", event => {
    if (event.touches.length !== 1) touch = undefined;
  }, { passive: true });
  on(stage, "touchcancel", () => { touch = undefined; }, { passive: true });
  on(stage, "touchend", event => {
    const start = touch;
    touch = undefined;
    if (!start || event.touches.length) return;
    const end = Array.from(event.changedTouches).find(point => point.identifier === start.id);
    if (!end) return;
    const dx = end.clientX - start.x, dy = end.clientY - start.y;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
  }, { passive: true });
  disposeGallery = () => { closeDialog(); events.abort(); revision++; };
}
