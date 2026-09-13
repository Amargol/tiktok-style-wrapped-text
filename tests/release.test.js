import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRelease } from '../scripts/check-npm-release.js';
const pkg = { name: 'tiktok-style-wrapped-text', version: '0.2.1' };

test('release check skips a version already present in npm', async () => {
  assert.equal(await checkRelease(pkg, async () => Response.json(pkg)), false);
});

test('release check permits an unpublished stable version', async () => {
  assert.equal(await checkRelease(pkg, async url => {
    assert.equal(url, 'https://registry.npmjs.org/tiktok-style-wrapped-text/0.2.1');
    return new Response('', { status: 404 });
  }), true);
});

test('registry failures do not authorize a publish', async () => {
  for (const status of [401, 403, 429, 500]) {
    await assert.rejects(checkRelease(pkg, async () => new Response('', { status })), /lookup failed/);
  }
  await assert.rejects(checkRelease(pkg, async () => { throw new Error('network failed'); }), /network failed/);
  await assert.rejects(checkRelease(pkg, async () => Response.json({ ...pkg, version: '0.2.0' })), /unexpected/);
});

test('release check rejects the private docs package and prereleases', async () => {
  const noRequest = () => { throw new Error('Should not request npm'); };
  await assert.rejects(checkRelease({ ...pkg, private: true }, noRequest), /public library/);
  await assert.rejects(checkRelease({ ...pkg, name: 'other-package' }, noRequest), /public library/);
  await assert.rejects(checkRelease({ ...pkg, version: '0.3.0-beta.1' }, noRequest), /stable/);
});
