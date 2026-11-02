// Kakao Developers 앱 키 및 SDK 설정 후 공유 기능을 구현합니다.
export function initKakaoShare(config, appConfig) {
  const button = document.querySelector("[data-share-button]");
  if (!button) return;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(config.share.url);
      button.textContent = "주소가 복사되었습니다";
      window.setTimeout(() => { button.textContent = "청첩장 주소 복사"; }, 2000);
    } catch {
      button.textContent = "주소 복사에 실패했습니다";
    }
  });

  // appConfig.kakaoJavascriptKey가 설정되면 Kakao SDK 공유 기능으로 교체합니다.
  void appConfig;
}
