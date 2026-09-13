import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TikTokText, RoundText } from '../dist/lib/ReactRoundText.js';

test('React wrapper renders on the server without browser globals', () => {
  const html = renderToStaticMarkup(createElement(TikTokText, {
    size: 48, color: 'teal', className: 'caption', debug: true,
  }, 'Find your happy place.'));
  assert.match(html, /<tiktok-text/);
  assert.match(html, /size="48"/);
  assert.match(html, /color="teal"/);
  assert.match(html, /class="caption"/);
  assert.match(html, /debug=""/);
  assert.match(html, /Find your happy place\./);
  assert.equal(RoundText, TikTokText);
});

test('React wrapper omits disabled debug and escapes caption text', () => {
  const html = renderToStaticMarkup(createElement(TikTokText, { debug: false }, '<script>hello</script>'));
  assert.doesNotMatch(html, /debug=|<script>/);
  assert.match(html, /&lt;script&gt;hello&lt;\/script&gt;/);
});
