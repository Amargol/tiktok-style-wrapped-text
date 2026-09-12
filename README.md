# TikTok Wrapped Text

TikTok-style text in one HTML tag. Connected rounded backgrounds, intelligent
width snapping, eleven color presets, four variants, and an optional React wrapper.
Zero runtime JavaScript dependencies. TikTok Sans is included under the OFL.

**Docs:** https://amargol.github.io/tiktok-style-wrapped-text/

```html
<script type="module" src="./roundtext/roundtext.js"></script>

<tiktok-text size="48" color="teal">Find your
happy place.</tiktok-text>
```

Copy `dist/lib` into your project as `roundtext`. Keep its `fonts` directory beside
the module. Serve over HTTP(S). The folder and module filenames stay compatible
with existing users; the package/project name is `tiktok-style-wrapped-text`.

- [Full API and React usage](dist/lib/README.md)
- [Library source](dist/lib/roundtext.js)
- [Six executable examples](dist/examples)
- [Reference overlays and measurements](dist/verification)

## Run locally

```sh
python3 scripts/build-docs.py
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. Optionally use `npm ci` and `npm run dev` for Vite.
Run the geometry checks with `npm test`; they need Node.js but no dependencies.

## GitHub Pages

The `Deploy docs` workflow validates the site, builds the download ZIP, runs the
geometry tests, and publishes `dist` on every push to `main`. No ChatGPT Sites
runtime, credentials, backend, or configuration is needed.

One-time repository setting: **Settings → Pages → Build and deployment → Source
→ GitHub Actions**. If the first workflow ran before Pages was enabled, rerun it
from the Actions tab (or select **Run workflow**).

All internal routes are relative, so the docs work under GitHub Pages' project
subdirectory as well as at a domain root. Generated ZIPs are built from source,
not committed.

## What is verified

Six supplied reference images have HTML recreations, overlays, and measured
differences. The reproduction is **not pixel-identical**. Chrome captures were
verified; Safari, Firefox, and React runtime integration remain unverified.
See the library README for renderer limits and the measurement methodology.

Code: [MIT](LICENSE). Font: [SIL OFL](dist/lib/fonts/OFL.txt).
Independent project; not affiliated with TikTok. Not published on npm.
