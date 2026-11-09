export function musicUrl(settings, music) {
  if (!music || typeof music.name !== 'string' || typeof music.path !== 'string') return '';
  // Only relative Storage object keys; do not allow URLs or traversal.
  const parts = music.path.split('/');
  if (parts.some(part => !part || part === '.' || part === '..') ||
      /[\\\\\u0000-\u001f]/.test(music.path) || !/\.(mp3|m4a|ogg)$/i.test(music.path)) return '';
  try {
    const base = new URL(settings.supabaseUrl);
    if (base.protocol !== 'https:' || base.pathname !== '/' || base.username || base.password) return '';
    return base.origin + '/storage/v1/object/public/wedding-music/' + parts.map(encodeURIComponent).join('/');
  } catch { return ''; }
}
export async function getMusic(settings, key, fetcher = fetch) {
  if (typeof key !== 'string' || !key.trim() || !settings.supabaseUrl || !settings.supabasePublishableKey) return null;
  const base = new URL(settings.supabaseUrl);
  if (base.protocol !== 'https:' || base.pathname !== '/' || base.username || base.password) throw Error('Invalid music endpoint');
  const response = await fetcher(base.origin + '/rest/v1/rpc/get_wedding_track', {
    method: 'POST', cache: 'no-store', headers: { apikey: settings.supabasePublishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_key: key.trim() }), signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw Error('Music unavailable');
  const music = await response.json();
  if (music === null) return null;
  if (!musicUrl(settings, music)) throw Error('Invalid music');
  return music;
}
