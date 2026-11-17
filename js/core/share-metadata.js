// Pure Open Graph data validation; no SDK, DOM, or network dependency.
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

export function getShareMetadata(config, baseUrl = config.share.url) {
  const url = publicHttpsUrl(baseUrl);
  let imageUrl;
  try {
    if (!config.share.image.visible || !config.share.image.src) throw new Error("image");
    imageUrl = publicHttpsUrl(config.share.image.src, url);
    if (/\.svg$/i.test(new URL(imageUrl).pathname)) throw new Error("image");
  } catch { throw new Error("image"); }
  return { title: config.share.title, description: config.share.description,
    url, imageUrl, imageAlt: config.share.image.alt };
}
