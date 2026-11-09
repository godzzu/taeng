import { getMusic, musicUrl } from '../services/music-api.js';
import { showToast } from '../core/utils.js';

let disposeMusic;
export function initMusic(config, settings, { load = getMusic, makeAudio = () => new Audio(), notify = showToast } = {}) {
  disposeMusic?.();
  const button = document.querySelector('[data-music-toggle]');
  if (!button) return { ready: Promise.resolve() };
  const events = new AbortController();
  let disposed = false, audio, pending = false, version = 0;
  button.hidden = true;
  function update() {
    const playing = pending || (audio && !audio.paused);
    button.textContent = playing ? '♫ 음악 정지' : '♫ 음악 재생';
    button.setAttribute('aria-label', playing ? '배경음악 정지' : '배경음악 재생');
    button.setAttribute('aria-pressed', String(!!playing));
  }
  function stop() {
    version++; pending = false;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    update();
  }
  const ready = (async () => {
    if (config.music?.visible === false || !config.music?.key) return;
    try {
      const music = await load(settings, config.music.key);
      if (disposed || !music) return;
      audio = makeAudio(); audio.preload = 'none'; audio.loop = true;
      audio.src = musicUrl(settings, music); audio.volume = .5;
      button.title = music.name; update(); button.hidden = false;
      button.addEventListener('click', async () => {
        if (pending || !audio.paused) { stop(); return; }
        const request = ++version; pending = true; update();
        try {
          // Call play directly in the user gesture for mobile Safari.
          await audio.play();
          if (disposed) { audio.pause(); return; }
          if (request !== version) return;
          pending = false; update();
        } catch {
          if (disposed || request !== version) return;
          stop(); notify('음악을 재생하지 못했습니다. 연결을 확인하고 다시 눌러 주세요.');
        }
      }, { signal: events.signal });
      for (const event of ['play', 'pause', 'ended']) audio.addEventListener(event, update, { signal: events.signal });
      audio.addEventListener('error', () => { if (!disposed) { stop(); notify('음악 파일을 불러오지 못했습니다.'); } }, { signal: events.signal });
      window.addEventListener('pagehide', stop, { signal: events.signal });
      document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); }, { signal: events.signal });
    } catch { /* Music is optional; keep invitation usable when unconfigured/offline. */ }
  })();
  disposeMusic = () => { disposed = true; events.abort(); stop(); if (audio) { audio.removeAttribute('src'); audio.load(); } button.hidden = true; };
  return { ready, destroy: disposeMusic };
}
