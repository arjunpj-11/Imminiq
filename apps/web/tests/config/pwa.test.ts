import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(import.meta.dirname, '../..');

describe('PWA production assets', () => {
  it('links the web manifest from the application shell', () => {
    const html = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
  });

  it('provides installable 192px and 512px icons', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(projectRoot, 'public/manifest.webmanifest'), 'utf8')
    ) as { icons: Array<{ sizes: string }> };

    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(
      expect.arrayContaining(['192x192', '512x512'])
    );
  });

  it('keeps API traffic out of the offline cache', () => {
    const serviceWorker = readFileSync(resolve(projectRoot, 'public/sw.js'), 'utf8');
    expect(serviceWorker).toContain("url.pathname.startsWith('/api/')");
  });
});
