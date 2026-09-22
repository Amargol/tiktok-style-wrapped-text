"""Build the downloadable library and verify static routes for GitHub Pages."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'

with ZipFile(DIST / 'roundtext-0.2.1.zip', 'w', ZIP_DEFLATED) as archive:
    for path in sorted((DIST / 'lib').rglob('*')):
        if path.is_file():
            archive.write(path, 'roundtext/' + path.relative_to(DIST / 'lib').as_posix())
    for path in sorted((DIST / 'examples').glob('*.html')):
        archive.writestr(path.name, path.read_text().replace('../lib/roundtext.js', './roundtext/roundtext.js'))
    for path in sorted((DIST / 'verification').iterdir()):
        if path.suffix in {'.png', '.json'}:
            archive.write(path, 'verification/' + path.name)
    for path in sorted((DIST / 'references').iterdir()):
        if path.is_file():
            archive.write(path, 'references/' + path.name)

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.ids = []
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        self.urls.extend(attrs[key] for key in ('src', 'href') if key in attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])

for page in DIST.rglob('*.html'):
    parsed = Links()
    parsed.feed(page.read_text())
    assert len(set(parsed.ids)) == len(parsed.ids), f'Duplicate IDs: {page}'
    for link in parsed.urls:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        if url.path:
            assert not url.path.startswith('/'), f'Root-relative URL breaks project Pages: {link}'
            target = (page.parent / unquote(url.path)).resolve()
            assert target.is_relative_to(DIST), f'Asset escapes docs directory: {link}'
            if target.is_dir():
                target /= 'index.html'
            assert target.is_file(), f'Missing asset: {page}: {link}'
        elif url.fragment:
            assert url.fragment in parsed.ids, f'Missing anchor: {page}: {link}'

(DIST / '.nojekyll').touch()
print('Built library ZIP; all HTML routes, anchors, and assets are valid.')
