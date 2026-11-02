// SDK 연결 시 이 payload를 Kakao.Share.sendDefault에 전달할 수 있습니다.
export function getKakaoSharePayload(config, baseUrl) {
  const pageUrl = config.share.url || baseUrl;
  const content = {
    title: config.share.title, description: config.share.description,
    link: { mobileWebUrl: pageUrl, webUrl: pageUrl }
  };
  if (config.share.image.visible && config.share.image.src) content.imageUrl = new URL(config.share.image.src, baseUrl).href;
  return { objectType: "feed", content };
}

// 현재 공유 버튼은 주소 복사 방식입니다. SDK 로딩/발송은 별도 연동입니다.
export function initKakaoShare(config, appConfig) {
  const button = document.querySelector("[data-share-button]");
  if (!button || !config.share.visible) return;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(config.share.url || window.location.href);
      button.textContent = config.labels.shareCopied;
      window.setTimeout(() => { button.textContent = config.labels.share; }, 2000);
    } catch { button.textContent = config.labels.shareFailed; }
  });
  void appConfig;
}
