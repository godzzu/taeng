let dispose;

const targets = [
  "h1", "h2", "h3", "p", "time", ".family-photo", ".family-heading",
  ".wedding-calendar", ".countdown-units > div", ".gallery-item", ".travel-icon",
  ".map-links > a", ".location-map-frame", ".account-group-toggle",
  ".account-card-header", ".account-payment", ".contact-open",
  ".guestbook-form > label", ".guestbook-form > input", ".guestbook-form > textarea",
  ".guestbook-form > button", "[data-guestbook-more]"
].join(",");

export function initSectionMotion() {
  dispose?.();
  const root = document.querySelector("#main-content");
  // Content remains visible if observation is unavailable or JS fails early.
  if (!root || typeof IntersectionObserver === "undefined") return;
  const registered = new WeakSet();
  const pending = new Set();
  const observer = new IntersectionObserver((entries, current) => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.style.setProperty("--reveal-delay", `${Math.min(order++ * 60, 240)}ms`);
      entry.target.classList.add("section-fade-up");
      pending.delete(entry.target);
      current.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: "0px 0px -48px 0px" });

  function register(node) {
    if (registered.has(node) || node.classList.contains("section-fade-up")) return;
    if (!node.closest(".section") || node.closest("[hidden], [aria-hidden='true']")) return;
    // Don't animate SDK internals, live error feedback or slideshow layers.
    if (node.closest(".hero-media, .location-map, .family-photo, .guestbook-count") && !node.matches(".family-photo")) return;
    if (node.closest('[role="status"], [aria-live]') && !node.matches(".countdown-message, .countdown-units > div")) return;
    // A photo, button or payment row animates as one unit, never nested twice.
    if (node.parentElement?.closest(".motion-item")) return;
    registered.add(node);
    node.classList.add("motion-item");
    pending.add(node);
    observer.observe(node);
  }
  function scan(scope) {
    if (scope.matches?.(targets)) register(scope);
    scope.querySelectorAll(targets).forEach(register);
  }
  // Remove legacy whole-panel animation when reinitializing a previous render.
  root.querySelectorAll(".section-inner.section-fade-up").forEach(node => node.classList.remove("section-fade-up"));
  scan(root);
  const mutations = typeof MutationObserver !== "undefined" ? new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "attributes") scan(record.target);
      else for (const node of record.addedNodes) if (node.nodeType === 1) scan(node);
    }
    for (const node of pending) {
      if (!root.contains(node)) { observer.unobserve(node); pending.delete(node); }
    }
  }) : null;
  mutations?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
  dispose = () => {
    observer.disconnect();
    mutations?.disconnect();
    for (const node of pending) node.classList.remove("motion-item");
    pending.clear();
  };
}
