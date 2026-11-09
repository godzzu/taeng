import assert from 'node:assert/strict';
import { musicUrl, getMusic } from '../js/services/music-api.js';
import { initMusic } from '../js/sections/music.js';
const path = 'catalog/우리의 노래.mp3';
const settings = { supabaseUrl: 'https://example.supabase.co', supabasePublishableKey: 'public' };
const music = { path, name: '우리의 노래' };
for (const path of ['../bad.mp3', 'a/../bad.mp3', '/a.mp3', 'a.html', 'https://evil.test/a.mp3']) {
  assert.equal(musicUrl(settings, { ...music, path }), '');
}
assert.equal(musicUrl({ supabaseUrl: 'http://unsafe.test' }, music), '');
assert.equal(musicUrl(settings, music), settings.supabaseUrl + '/storage/v1/object/public/wedding-music/catalog/' + encodeURIComponent('우리의 노래.mp3'));
let requests = 0;
const fetcher = async (url, options) => {
  requests++; assert.equal(url, settings.supabaseUrl + '/rest/v1/rpc/get_wedding_track');
  assert.deepEqual(JSON.parse(options.body), {p_key:'piano-01'});
  return {ok:true, json:async()=>music};
};
assert.deepEqual(await getMusic(settings, ' piano-01 ', fetcher), music);
assert.equal(await getMusic(settings, '', fetcher), null);
assert.equal(requests, 1);
assert.equal(await getMusic(settings, 'missing', async()=>({ok:true,json:async()=>null})), null);
await assert.rejects(getMusic(settings, 'piano-01', async()=>({ok:false})));
await assert.rejects(getMusic(settings, 'piano-01', async()=>({ok:true,json:async()=>({path:'../a.mp3',name:'bad'})})));

class FakeAudio extends EventTarget {
  paused = true; currentTime = 0; playCalls = 0; fail = false;
  async play() { this.playCalls++; if (this.fail) throw Error('blocked'); this.paused = false; this.dispatchEvent(new Event('play')); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  removeAttribute() {} load() {}
}
class Button extends EventTarget {
  attributes = {}; hidden = false;
  setAttribute(key, value) { this.attributes[key] = value; }
}
const button = new Button(), audio = new FakeAudio(), notices = [];
globalThis.document = Object.assign(new EventTarget(), { querySelector: () => button, hidden: false });
globalThis.window = new EventTarget();
const flush = () => new Promise(resolve => setImmediate(resolve));
try {
  const service = initMusic({ music: { visible: true, key: 'piano-01' } }, settings, { load: async (settings, key) => { assert.equal(key, 'piano-01'); return music; }, makeAudio: () => audio, notify: message => notices.push(message) });
  await service.ready; assert.equal(button.hidden, false); assert.equal(audio.playCalls, 0); assert.equal(audio.preload, 'none');
  button.dispatchEvent(new Event('click')); await flush(); assert.equal(audio.paused, false);
  assert.equal(button.attributes['aria-pressed'], 'true');
  assert.equal(button.attributes['aria-label'], '배경음악 정지');
  audio.currentTime = 15; button.dispatchEvent(new Event('click')); await flush();
  assert.equal(audio.currentTime, 0); assert.equal(audio.paused, true);
  assert.equal(button.attributes['aria-label'], '배경음악 재생');
  audio.fail = true; button.dispatchEvent(new Event('click')); await flush(); assert.equal(notices.length, 1);
  audio.fail = false; button.dispatchEvent(new Event('click')); await flush();
  document.hidden = true; document.dispatchEvent(new Event('visibilitychange')); assert.equal(audio.paused, true);
  service.destroy(); assert.equal(button.hidden, true);
  await initMusic({music:{key:'missing'}}, settings, { load: async () => null }).ready; assert.equal(button.hidden, true);
  let calls = 0;
  await initMusic({ music: { visible: false } }, settings, { load: async () => { calls++; } }).ready;
  await initMusic({ music: { visible: true, key: '' } }, settings, { load: async () => { calls++; } }).ready;
  assert.equal(calls, 0);
} finally { delete globalThis.document; delete globalThis.window; }
console.log('PASS: catalog key lookup, safe paths, missing/disabled music, no autoplay, play/stop, errors and lifecycle');
