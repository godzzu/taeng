const SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.2/kakao.min.js";
let sdkPromise, disposeShare;

export function publicHttpsUrl(value, base) {
  let url;
  try { url = new URL(value, base); } catch { throw new Error("url"); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password ||
      !host.includes(".") || host === "localhost" || host.endsWith(".localhost") ||
      host.endsWith(".local") || host.endsWith(".internal") || host.includes(":") ||
      /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) throw new Error("url");
  return url.href;
}

export function getKakaoSharePayload(config, baseUrl) {
  const pageUrl = publicHttpsUrl(config.share.url || baseUrl);
  let imageUrl;
  try {
    if (!config.share.image.visible || !config.share.image.src) throw new Error("image");
    imageUrl = publicHttpsUrl(config.share.image.src, pageUrl);
    if (/\.svg$/i.test(new URL(imageUrl).pathname)) throw new Error("image");
  } catch { throw new Error("image"); }
  return {
    objectType: "feed",
    content: {
      title: config.share.title, description: config.share.description,
      imageUrl, link: { mobileWebUrl: pageUrl, webUrl: pageUrl }
    }
  };
}

export function loadKakaoSdk() {
  if (globalThis.Kakao?.Share) return Promise.resolve(globalThis.Kakao);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    let done = false;
    const finish = error => {
      if (done) return;
      done = true; clearTimeout(timer);
      script.onload = script.onerror = null;
      if (error) { script.remove(); reject(new Error("sdk")); }
      else resolve(globalThis.Kakao);
    };
    const timer = setTimeout(() => finish(true), 12000);
    script.src = SDK_URL; script.async = true; script.crossOrigin = "anonymous";
    script.onload = () => finish(!globalThis.Kakao?.Share);
    script.onerror = () => finish(true);
    document.head.append(script);
  }).catch(error => { sdkPromise = undefined; throw error; });
  return sdkPromise;
}

export function checkShareImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => finish(false), 10000);
    function finish(ok) {
      clearTimeout(timer); img.onload = img.onerror = null;
      if (ok) resolve(); else reject(new Error("image"));
    }
    img.onload = () => finish(img.naturalWidth > 0);
    img.onerror = () => finish(false);
    img.src = url;
  });
}

export function initKakaoShare(config, appConfig, dependencies = {}) {
  disposeShare?.();
  const button = document.querySelector("[data-share-button]");
  const status = document.querySelector("[data-share-status]");
  if (!button || !status) return;
  button.hidden = !config.share.visible;
  status.textContent = "";
  if (!config.share.visible) return;
  let active = true, ready = false, preparing = false, sdk, payload;
  const events = new AbortController();
  disposeShare = () => { active = false; events.abort(); };
  const loadSdk = dependencies.loadSdk || loadKakaoSdk;
  const checkImage = dependencies.checkImage || checkShareImage;
  const labels = config.labels;
  const key = appConfig.kakaoJavascriptKey?.trim();
  const errors = { key: labels.shareNoKey, url: labels.shareInvalidUrl, image: labels.shareInvalidImage, sdk: labels.shareSdkError };
  async function prepare() {
    if (preparing) return;
    preparing = true; button.disabled = true;
    status.textContent = labels.shareLoading;
    try {
      if (!key) throw new Error("key");
      payload = getKakaoSharePayload(config, document.baseURI);
      sdk = await loadSdk();
      if (!active) return;
      try {
        if (!sdk.isInitialized()) sdk.init(key);
        if (!sdk.isInitialized() || (sdk.Auth?.getAppKey && sdk.Auth.getAppKey() !== key)) throw new Error("sdk");
      } catch { throw new Error("sdk"); }
      await checkImage(payload.content.imageUrl);
      if (!active) return;
      ready = true; status.textContent = labels.shareReady;
    } catch (error) {
      if (active) { ready = false; status.textContent = errors[error.message] || labels.shareSdkError; }
    } finally {
      preparing = false;
      if (active) { button.disabled = false; button.textContent = labels.share; }
    }
  }
  button.textContent = labels.share;
  button.addEventListener("click", () => {
    if (!ready) { void prepare(); return; }
    try {
      // Keep this synchronous in the click handler so mobile/PC popup activation survives.
      sdk.Share.sendDefault(payload);
      status.textContent = labels.shareOpened; // This is not a delivery receipt.
    } catch {
      status.textContent = labels.shareSendError;
    }
  }, { signal: events.signal });
  void prepare();
}

