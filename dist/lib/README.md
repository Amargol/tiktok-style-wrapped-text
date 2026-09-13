# TikTok Wrapped Text 0.2.0

TikTok-style captions in one HTML tag: connected rounded backgrounds, transitive width snapping, color presets, and rounded glyph outlines. The original text stays in the DOM. No runtime JavaScript dependencies; the included TikTok Sans variable font is loaded automatically.

## Install

```sh
npm install tiktok-style-wrapped-text
```

With a browser bundler:

```js
import 'tiktok-style-wrapped-text';
```

For plain HTML, copy `node_modules/tiktok-style-wrapped-text` into your public assets as `roundtext`. Keep `fonts/` beside `roundtext.js`, including the font license. The repository's `dist/lib` folder works the same way.

## HTML

Keep the entire `roundtext` folder together and serve your page over HTTP(S).

```html
<script type="module" src="./roundtext/roundtext.js"></script>
<tiktok-text>This is
multiline text
that
wraps</tiktok-text>
```

```html
<tiktok-text size="48" color="teal">A connected background</tiktok-text>
<tiktok-text size="48" color="yellow" variant="outline">Outlined letters</tiktok-text>
<tiktok-text color="white" variant="hollow">Transparent inside</tiktok-text>
<tiktok-text color="black" variant="plain">Plain text</tiktok-text>
```

Newlines are preserved, including indentation. Use one source line for automatic wrapping, literal newlines or `<br>` for explicit breaks. An empty line leaves a gap. Set `textContent` to edit safely. Place the component inside a heading if heading semantics are needed.

## React / Tailwind

```tsx
import { TikTokText } from 'tiktok-style-wrapped-text/react';

<TikTokText size={48} color="blue" className="max-w-md">
  {'This is\nmultiline text'}
</TikTokText>
```

The wrapper includes compiled JavaScript and TypeScript declarations, registers the element on the client, and forwards a ref. Its TSX source is also included for direct folder-based use. React 18+ is optional and only required by the wrapper. The plain HTML runtime does not use React. Package imports, TypeScript types, and server rendering have been checked with React 18 and 19, along with a Vite production build that includes the font. Client-side React mounting still needs browser integration testing.

## Simple API

| Attribute | Default | Meaning |
| --- | --- | --- |
| `size` | `40` | Font size in pixels |
| `color` | `black` | Named palette color or CSS color |
| `variant` | `box` | `box`, `plain`, `outline`, `hollow` |
| `align` | `center` | `left`, `center`, `right`, `start`, `end` |
| `snap` | `on` | `off` keeps original line widths |
| `debug` | absent | Presence displays the computed line bands |

Palette: black, white, red, orange, yellow, green, teal, cyan, blue, indigo, purple. Yellow includes brown lettering on a yellow background. Outline colors follow the provided TikTok references. Set `--rt-outline` to override.

`round-text` remains an alias with the same updated defaults. v0.2 changes the original defaults from blue/Arial to the calibrated black/TikTok Sans style.

## Advanced overrides

Use CSS for host width and layout. Put surrounding padding/borders on a wrapper. Font/padding/corner defaults are calibrated as a group; arbitrary font overrides reduce fidelity, especially for glyph outlines.

| Property | Default | Meaning |
| --- | --- | --- |
| `--rt-bg` | palette | Background fill |
| `--rt-color` | palette | HTML text fill |
| `--rt-outline` | palette | Glyph outline color |
| `--rt-radius` | `0.23em` | Outer and inner corner radius |
| `--rt-px` | `0.437em` | Horizontal padding |
| `--rt-py` | `0.1335em` | Vertical outer padding |
| `--rt-stroke` | `0.145em` | Full SVG stroke width (half extends outside the glyph) |
| `--rt-snap` | twice the radius | Maximum adjacent edge difference for snapping |

Radius, stroke, and snap accept pixel values or `em`. Padding accepts nonnegative CSS lengths, excluding percentages. The font is TikTok Sans with fixed optical/width axes and a calibrated weight; geometry scales with font size. Plain text uses its own calibrated weight/optical settings. Internal band overlaps and text baseline compensation are size-relative.

```js
import { ready } from 'tiktok-style-wrapped-text';
await ready();
const element = document.querySelector('tiktok-text');
element.refresh(); // synchronous measurement; capture after this
```

Resizes, text mutations, font loads, and changes to the component's attributes schedule one refresh per animation frame. Observers/listeners are removed on disconnect. Call `refresh()` after external stylesheet changes that alter typography without resizing the element. `ready()` rejects if the font cannot load. Elements also emit `roundtext:error` with a useful message.

`roundtext:render` exposes `{ lines, path, rectangles, unsnapped }` in its event detail. It fires directly on the element and does not bubble. `path` contains the background shape only. `outline(rectangles, radius)` and `snapLines(rectangles, threshold)` are exported pure geometry utilities.

## How the renderer works

1. DOM Range measurements recover the browser's wrapped line fragments.
2. Neighboring line edges are compared in their original state. Union-find groups similar edges transitively, so `snaps / xxxx / see / how / these` becomes a straight block. Large changes remain steps.
3. Size-relative overlapping line bands are merged using a rectangle union. Circular arcs round concave and convex corners.
4. The background is SVG; original text stays HTML. Rounded glyph strokes use SVG text behind the HTML. Hollow mode masks the glyph interiors so the actual backdrop shows through.

## Reference verification

The download includes six executable HTML recreations and the measured Chrome comparison report. The docs provide original, live recreation, adjustable overlay, and amplified pixel-difference views.

**The result is not pixel-identical to the supplied screenshots.** Do not describe background overlap as full-image similarity. Font contours, alignment, antialiasing, and JPEG compression/color differences remain. This is a measured reproduction of the screenshots, not TikTok's proprietary renderer or a universal guarantee across TikTok versions/devices.

The comparison uses the same 1080 × 1920 coordinates with no post-capture alignment. Foreground RGB MAE excludes the empty background; background IoU fills text holes in the background shape. Both Chrome capture compression and original JPEG artifacts remain in the difference. All six cases and copyable placement code are included. A perfect pixel difference would be black; these differences are nonzero.

## Scope

Short horizontal captions with one size per component. Different components can use different sizes. Background layout supports left/center/right alignment, automatic wrapping, explicit line breaks and blank lines. The included font supports Latin, Greek and Cyrillic; use fallback fonts for other scripts at lower fidelity. Glyph outline positioning is calibrated to the included font and left-to-right text; complex bidirectional glyph-outline runs are not verified.

Vertical writing, mixed-size inline content, columns, nested block layouts, inline images and rotated/skewed measurement are outside scope. Positive axis-aligned scale and translation are normalized. Very large padding can merge shapes. This is not a high-volume rich-text engine; coordinate compression uses quadratic memory in the line-coordinate count.

Text remains visible without JavaScript, but its background and outlines require JavaScript. Server-rendered text may briefly show fallback styling before the font loads. Shadow DOM support varies between DOM-to-canvas exporters; prefer actual browser screenshots. Chrome rendering and playground interactions are checked; Firefox/Safari are unverified.

## Licenses

Code: MIT (LICENSE). Included font: SIL Open Font License (fonts/OFL.txt).
Official font source: https://github.com/tiktok/TikTokSans
Font distribution used: Google Fonts ofl/tiktoksans, downloaded 2026-09-07.
Independent project; not affiliated with TikTok.
