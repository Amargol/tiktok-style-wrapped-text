import {ready, colors} from './lib/roundtext.js';

const $ = selector => document.querySelector(selector);
const state = {text: $('#caption').value, variant: 'box', color: 'black', size: 48, snap: true, language: 'html'};
const variants = ['box', 'plain', 'outline', 'hollow'];
const escapeHTML = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const scriptTag = '<script type="module" src="./roundtext/roundtext.js"></script>';
const quickStart = `<!-- Copy dist/lib into ./roundtext -->\n${scriptTag}\n\n<tiktok-text size="48" color="teal">\n  Find your<br>happy place.\n</tiktok-text>`;
let toastTimer;

function codeForState() {
  if (state.language === 'react') {
    return `'use client';\nimport { TikTokText } from './roundtext/ReactRoundText.js';\n\n<TikTokText size={${state.size}} color="${state.color}" variant="${state.variant}"${state.snap ? '' : ' snap="off"'}>\n  {${JSON.stringify(state.text)}}\n</TikTokText>`;
  }
  return `<tiktok-text size="${state.size}" color="${state.color}" variant="${state.variant}"${state.snap ? '' : ' snap="off"'}>\n  ${escapeHTML(state.text).replaceAll('\n', '<br>')}\n</tiktok-text>`;
}

function render() {
  const caption = $('#live-caption');
  $('.live-canvas').classList.toggle('dark-preview', state.color !== 'black' && (state.variant !== 'box' || state.color === 'white'));
  caption.textContent = state.text;
  for (const key of ['variant', 'color', 'size']) caption.setAttribute(key, String(state[key]));
  caption.setAttribute('snap', state.snap ? 'on' : 'off');
  $('#caption').value = state.text;
  $('#size').value = state.size;
  $('#size-value').textContent = `${state.size} px`;
  $('#snap').checked = state.snap;
  $('#color-name').textContent = state.color[0].toUpperCase() + state.color.slice(1);
  document.querySelectorAll('[data-variant]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.variant === state.variant)));
  document.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === state.color)));
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === state.language)));
  const plainCode = codeForState();
  // Tokenize before adding markup so user-entered text is always escaped.
  const tokens = plainCode.split(/("[^"\n]*"|'[^'\n]*'|<\/?[\w-]+|\/?>)/g);
  $('#demo-code').innerHTML = tokens.map(token => {
    const safe = escapeHTML(token);
    if (/^["']/.test(token)) return `<span class="code-string">${safe}</span>`;
    if (/^<|^\/?>$/.test(token)) return `<span class="code-tag">${safe}</span>`;
    return safe;
  }).join('');
  caption.refresh();
}

for (const [name, palette] of Object.entries(colors)) {
  const button = document.createElement('button');
  button.className = 'swatch';
  button.dataset.color = name;
  button.style.setProperty('--swatch', palette.background);
  button.setAttribute('aria-label', name[0].toUpperCase() + name.slice(1));
  button.title = name;
  button.addEventListener('click', () => { state.color = name; render(); });
  $('#colors').append(button);
}
function updateStyleComparison() {
  const color = $('#comparison-color').value;
  if (!Object.hasOwn(colors, color)) return;
  $('#comparison-color-swatch').style.backgroundColor = colors[color].background;
  $('#style-comparison').classList.toggle('comparison-light', ['black', 'indigo', 'purple'].includes(color));
  document.querySelectorAll('#style-comparison tiktok-text').forEach(example => {
    example.setAttribute('color', color);
    example.refresh();
  });
}
$('#comparison-color').addEventListener('change', updateStyleComparison);
updateStyleComparison();

$('#caption').addEventListener('input', event => {state.text = event.target.value; render();});
$('#size').addEventListener('input', event => {state.size = Number(event.target.value); render();});
$('#snap').addEventListener('change', event => {state.snap = event.target.checked; render();});
document.querySelectorAll('[data-variant]').forEach(button => button.addEventListener('click', () => {state.variant = button.dataset.variant; render();}));
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {state.language = button.dataset.language; render();}));

document.querySelectorAll('.style-card').forEach(card => {
  const example = card.querySelector('tiktok-text');
  const button = document.createElement('a');
  button.href = '#playground';
  button.className = 'style-card-link';
  button.setAttribute('aria-label', `Try the ${example.getAttribute('variant') || 'box'} style in the playground`);
  button.addEventListener('click', () => {
    state.variant = example.getAttribute('variant') || 'box';
    state.color = example.getAttribute('color');
    state.text = example.innerHTML.replace(/<br\s*\/?\s*>/gi, '\n');
    state.size = Number(example.getAttribute('size'));
    render();
  });
  card.append(button);
});

function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2500);
}

document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const code = button.dataset.copy === 'start' ? quickStart : button.dataset.copy === 'hero' ? 'npm install tiktok-style-wrapped-text' : state.language === 'html' ? `${scriptTag}\n\n${codeForState()}` : codeForState();
  try {
    await navigator.clipboard.writeText(code);
    notify('Code copied.');
  } catch {
    notify('Clipboard unavailable. Select and copy the code below.');
    if (button.dataset.copy === 'hero') document.querySelector('#start').scrollIntoView({behavior:'smooth'});
  }
}));

document.querySelectorAll('tiktok-text').forEach(element => element.addEventListener('roundtext:error', () => notify('Caption font could not load. Please refresh the page.')));
render();
ready().then(() => document.querySelectorAll('tiktok-text').forEach(element => element.refresh())).catch(() => notify('Caption font could not load. Please refresh the page.'));

// Optional agent access uses the same state and renderer as the visible controls.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  window.addEventListener('pagehide', () => lifecycle.abort(), {once: true});
  try {
    Promise.resolve(document.modelContext.registerTool({
      name: 'configure_caption_demo',
      description: 'Update the local caption playground and return its current code. Does not save or publish anything.',
      inputSchema: {type:'object', properties:{text:{type:'string',maxLength:220},variant:{type:'string',enum:variants},color:{type:'string',enum:Object.keys(colors)},size:{type:'integer',minimum:24,maximum:64},snap:{type:'boolean'},language:{type:'string',enum:['html','react']}},additionalProperties:false},
      annotations: {readOnlyHint:false,untrustedContentHint:true},
      async execute(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected a caption configuration.');
        for (const [key,value] of Object.entries(input)) {
          if (!Object.hasOwn(state,key)) throw new Error('Unknown caption setting.');
          if (key === 'text' && (typeof value !== 'string' || value.length > 220)) throw new Error('Caption must be at most 220 characters.');
          if (key === 'variant' && !variants.includes(value)) throw new Error('Unknown text style.');
          if (key === 'color' && (typeof value !== 'string' || !Object.hasOwn(colors,value))) throw new Error('Unknown color.');
          if (key === 'size' && (!Number.isInteger(value) || value < 24 || value > 64)) throw new Error('Size must be between 24 and 64.');
          if (key === 'snap' && typeof value !== 'boolean') throw new Error('Snap must be a boolean.');
          if (key === 'language' && !['html','react'].includes(value)) throw new Error('Unknown code language.');
        }
        Object.assign(state,input); render();
        await ready(); $('#live-caption').refresh();
        return {configuration:{...state},code:codeForState()};
      }
    }, {signal:lifecycle.signal})).catch(() => {});
  } catch { /* Optional browser feature; the playground works without it. */ }
}
