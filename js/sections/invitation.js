import { createElement } from "../core/utils.js";
import { initFamilySlideshow } from "../core/family-slideshow.js";
let disposePhotos = [];
export function initInvitation(config) {
  disposePhotos.forEach(dispose => dispose());
  disposePhotos = [];
  const section = document.querySelector("#invitation");
  if (!section) return;
  section.hidden = !config.invitation.visible;
  const title = section.querySelector("h2");
  title.textContent = config.invitation.title;
  const subtitle = section.querySelector(".eyebrow");
  subtitle.textContent = config.invitation.subtitle;
  subtitle.hidden = !config.invitation.subtitle;
  const titleImage = config.invitation.titleImage;
  if (titleImage?.visible && titleImage.src) {
    const image = createElement("img", "invitation-title-image");
    image.alt = titleImage.alt || "초대합니다";
    image.loading = "lazy";
    image.decoding = "async";
    image.onerror = () => {
      title.textContent = config.invitation.title || titleImage.alt || "초대합니다";
      subtitle.hidden = !config.invitation.subtitle;
    };
    image.src = titleImage.src;
    title.replaceChildren(image);
    subtitle.hidden = true;
  }
  const message = section.querySelector('[data-field="message"]');
  message.textContent = config.invitation.message;
  message.hidden = !config.invitation.message.trim();
  const families = section.querySelector('[data-field="families"]');
  families.replaceChildren();
  config.invitation.parents.forEach(data => {
    const parents = [[data.father, data.fatherDeceased], [data.mother, data.motherDeceased]].filter(([name]) => name);
    if (!parents.length && !data.relation && !data.name && !data.description && !data.image?.src) return;
    const item = createElement("li", "family-item");
    if (data.person === "bride") item.setAttribute("data-family-side", "bride");
    if (data.image?.visible) {
      const photo = createElement("div", "family-photo");
      const fallback = createElement("span", "family-photo-fallback", data.image.alt || `${data.name || data.label} 사진`);
      photo.append(fallback);
      const images = data.images ?? (data.image.src ? [data.image] : []);
      if (images.length && !section.hidden) disposePhotos.push(initFamilySlideshow(photo, fallback, images));
      item.append(photo);
    }
    const heading = createElement("div", "family-heading");
    if (data.label) heading.append(createElement("span", "family-label", data.label));
    if (data.name) heading.append(createElement("strong", "family-relation", data.name));
    item.append(heading);
    if (data.description) {
      item.append(createElement("p", "family-description", data.description));
    } else if (parents.length || data.relation) {
      const description = createElement("p", "family-description");
      const names = createElement("strong", "family-parents");
      parents.forEach(([name, deceased], index) => {
        if (index) names.append(createElement("span", "family-separator", " · "));
        const person = createElement("span", "family-person");
        if (deceased) {
          const flower = createElement("span", "memorial-flower");
          flower.setAttribute("role", "img");
          flower.setAttribute("aria-label", "고인");
          person.append(flower);
        }
        person.append(createElement("span", "family-person-name", name));
        names.append(person);
      });
      if (parents.length) description.append(names);
      if (data.relation) description.append(createElement("span", "family-relationship", `${parents.length ? "의 " : ""}${data.relation}`));
      item.append(description);
    }
    families.append(item);
  });
  families.hidden = !families.children.length;
}
