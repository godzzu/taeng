import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, mkdir, copyFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { publicConfig, writePublicConfig } from "../scripts/build-config.mjs";

const env = { PUBLIC_KAKAO_JAVASCRIPT_KEY: 'quote"\nvalue', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test', SECRET_PASSWORD: 'never-export', PUBLIC_UNKNOWN: 'also-never-export' };
const config = publicConfig(env);
assert.equal(Object.keys(config).length, 6);
assert.equal(config.kakaoJavascriptKey, env.PUBLIC_KAKAO_JAVASCRIPT_KEY);
assert.equal(config.guestbookWeddingId, 'default');
assert(!JSON.stringify(config).includes('never-export'));
assert.throws(() => publicConfig({ PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_do-not-export' }));
const jwt = role => `header.${Buffer.from(JSON.stringify({role})).toString('base64url')}.signature`;
assert.throws(() => publicConfig({ PUBLIC_SUPABASE_PUBLISHABLE_KEY: jwt('service_role') }));
assert.equal(publicConfig({ PUBLIC_SUPABASE_PUBLISHABLE_KEY: jwt('anon') }).supabasePublishableKey, jwt('anon'));
const directory = await mkdtemp(join(tmpdir(), 'wedding-env-test-'));
try {
  const path = join(directory, 'public-env.js');
  await writePublicConfig(path, env);
  const source = await readFile(path, 'utf8');
  const imported = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  assert.deepEqual(imported.publicEnv, config);
  // Exercise the actual launcher with a fixture, including Windows drive paths.
  await mkdir(join(directory, 'scripts'));
  const launcher = join(directory, 'scripts/with-env.mjs');
  await copyFile(new URL('../scripts/with-env.mjs', import.meta.url), launcher);
  await writeFile(join(directory, '.env'), 'WEDDING_ENV_FIXTURE="from-file"\n');
  const childEnv = { ...process.env };
  delete childEnv.WEDDING_ENV_FIXTURE;
  const run = env => spawnSync(process.execPath, [launcher, '-e', 'process.stdout.write(process.env.WEDDING_ENV_FIXTURE || "missing")'], { env, encoding: 'utf8' });
  let child = run(childEnv);
  assert.equal(child.status, 0);
  assert.equal(child.stdout, 'from-file');
  child = run({ ...childEnv, WEDDING_ENV_FIXTURE: 'from-ci' });
  assert.equal(child.status, 0);
  assert.equal(child.stdout, 'from-ci');
} finally { await rm(directory, { recursive: true, force: true }); }
console.log('PASS: public env allowlist, secret-key rejection, defaults and safe JS serialization');
