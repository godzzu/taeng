import { getWeddingConfig } from "./core/config.js";
import { renderConfig } from "./core/config-view.js";
import { applyTheme } from "./core/theme.js";
import { initHero } from "./sections/hero.js";
import { initInvitation } from "./sections/invitation.js";
import { initWeddingInfo } from "./sections/wedding-info.js";
import { initGallery } from "./sections/gallery.js";
import { initLocation } from "./sections/location.js";
import { initAccount } from "./sections/account.js";
import { initContact } from "./sections/contact.js";
import { initGuestbook } from "./sections/guestbook.js";
import { initKakaoShare } from "./services/kakao-share.js";
import { appConfig } from "../config/app.config.js";

function initializeWedding() {
  const config = getWeddingConfig();
  applyTheme(config.templateId);
  renderConfig(config);

  // 각 섹션은 독립적인 init 함수로 초기화합니다.
  initHero(config);
  initInvitation(config);
  initWeddingInfo(config);
  initGallery(config);
  initLocation(config);
  initAccount(config);
  initContact(config);
  initGuestbook(config);
  initKakaoShare(config, appConfig);

  document.title = config.share.title;
}

initializeWedding();
