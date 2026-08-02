import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const infrastructureFile = new URL('../../../../infra/aws/production.yaml', import.meta.url);

describe('production content security policy', () => {
  it('allows Cloudinary voice messages to be fetched and played', () => {
    const policy = readFileSync(infrastructureFile, 'utf8');

    expect(policy).toContain('connect-src');
    expect(policy).toMatch(/connect-src[^;]*https:/);
    expect(policy).toMatch(/media-src[^;]*https:/);
  });

  it('allows privacy-enhanced YouTube videos to play inside tracker pages', () => {
    const policy = readFileSync(infrastructureFile, 'utf8');

    expect(policy).toMatch(/frame-src[^;]*https:\/\/www\.youtube-nocookie\.com/);
  });
});
