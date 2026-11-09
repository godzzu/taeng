let sdkPromise;

export function loadKakaoMaps(key) {
  if (globalThis.kakao?.maps?.Map) return Promise.resolve(globalThis.kakao.maps);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    let finished = false;
    const finish = (error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      script.onload = script.onerror = null;
      if (error) { script.remove(); reject(error); }
      else resolve(globalThis.kakao.maps);
    };
    const timer = setTimeout(() => finish(new Error("Map SDK timeout")), 12000);
    script.async = true;
    script.src = "https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=" + encodeURIComponent(key);
    script.onerror = () => finish(new Error("Map SDK failed"));
    script.onload = () => {
      try {
        globalThis.kakao.maps.load(() => finish(globalThis.kakao.maps.Map ? null : new Error("Map SDK unavailable")));
      } catch (error) { finish(error); }
    };
    document.head.append(script);
  }).catch(error => { sdkPromise = undefined; throw error; });
  return sdkPromise;
}

export function getMapLinks(config) {
  const { coordinates, links } = config.location;
  const name = config.weddingInfo.venue || config.weddingInfo.address;
  const query = config.weddingInfo.address || name;
  return links.map(link => {
    if (link.url) {
      // A configured place/search URL must not promise turn-by-turn directions.
      const url = new URL(link.url);
      if (url.hostname === "map.kakao.com" && /^\/link\/(map|search)\//.test(url.pathname)) {
        return { ...link, label: config.labels.kakaoSearch };
      }
      if (url.hostname === "map.naver.com" && /^\/(v5|p)\/search\//.test(url.pathname)) {
        return { ...link, label: config.labels.naverSearch };
      }
      return link;
    }
    if (link.provider === "kakao" && coordinates) {
      return { ...link, url: `https://map.kakao.com/link/to/${encodeURIComponent(name)},${coordinates.latitude},${coordinates.longitude}` };
    }
    if (!query) return null;
    if (link.provider === "kakao") return { ...link, label: config.labels.kakaoSearch, url: "https://map.kakao.com/link/search/" + encodeURIComponent(query) };
    if (link.provider === "naver") return { ...link, label: config.labels.naverSearch, url: "https://map.naver.com/p/search/" + encodeURIComponent(query) };
    return null;
  }).filter(Boolean);
}

// Rendering lifecycle stays here, separate from location content and buttons.
export function initMapService({ config, appConfig = {}, container, status }, loadSdk = loadKakaoMaps) {
  let disposed = false, map, marker, observer, timer, maps, onTiles;
  const showFallback = message => {
    container.hidden = true;
    container.replaceChildren();
    status.hidden = false;
    status.textContent = message;
  };
  container.hidden = true;
  container.setAttribute("role", "region");
  container.setAttribute("aria-label", config.labels.mapLabel.replace("{venue}", config.weddingInfo.venue));
  const clearMap = () => {
    clearTimeout(timer);
    observer?.disconnect();
    if (maps && map && onTiles) maps.event.removeListener(map, "tilesloaded", onTiles);
    marker?.setMap(null);
  };
  const ready = (async () => {
    if (!config.location.visible) { status.hidden = true; return "hidden"; }
    const coordinates = config.location.coordinates;
    if (!coordinates) { showFallback(config.labels.mapNoCoordinates); return "no-coordinates"; }
    const key = (appConfig.kakaoMapJavascriptKey || appConfig.kakaoJavascriptKey || "").trim();
    if (!key) { showFallback(config.labels.mapUnavailable); return "no-key"; }
    status.hidden = false;
    status.textContent = config.labels.mapLoading;
    try {
      maps = await loadSdk(key);
      if (disposed) return "disposed";
      container.hidden = false;
      const center = new maps.LatLng(coordinates.latitude, coordinates.longitude);
      map = new maps.Map(container, { center, level: 3, scrollwheel: false });
      marker = new maps.Marker({ position: center, map, title: config.weddingInfo.venue });
      onTiles = () => {
        clearTimeout(timer);
        if (!disposed) { status.textContent = ""; status.hidden = true; }
      };
      maps.event.addListener(map, "tilesloaded", onTiles);
      timer = setTimeout(() => {
        if (!disposed) { clearMap(); showFallback(config.labels.mapUnavailable); }
      }, 12000);
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          if (!disposed && !container.hidden) { map.relayout(); map.setCenter(center); }
        });
        observer.observe(container);
      }
      return "ready";
    } catch {
      if (!disposed) { clearMap(); showFallback(config.labels.mapUnavailable); }
      return disposed ? "disposed" : "error";
    }
  })();
  return {
    ready,
    destroy() {
      disposed = true;
      clearMap();
      container.replaceChildren();
      container.hidden = true;
    }
  };
}
