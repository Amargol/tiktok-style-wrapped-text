import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export async function checkRelease(pkg, fetchMetadata = fetch) {
  if (pkg.name !== 'tiktok-style-wrapped-text' || pkg.private) {
    throw new Error('Expected the public library package in dist/lib/package.json.');
  }
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(pkg.version)) {
    throw new Error('Automatic releases require a stable major.minor.patch version.');
  }
  const url = `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${pkg.version}`;
  const response = await fetchMetadata(url, { signal: AbortSignal.timeout(30_000) });
  if (response.status === 404) return true;
  if (!response.ok) throw new Error(`npm version lookup failed: HTTP ${response.status}`);
  const published = await response.json();
  if (published.name !== pkg.name || published.version !== pkg.version) {
    throw new Error('npm returned unexpected package metadata.');
  }
  return false;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pkg = JSON.parse(readFileSync(new URL('../dist/lib/package.json', import.meta.url), 'utf8'));
  const publish = await checkRelease(pkg);
  console.log(`${pkg.name}@${pkg.version}: ${publish ? 'ready to publish' : 'already published; skipping'}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `publish=${publish}\nversion=${pkg.version}\n`);
  }
}
