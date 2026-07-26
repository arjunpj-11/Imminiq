import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const deploymentFile = new URL('../../vercel.json', import.meta.url);

describe('production content security policy', () => {
  it('allows Cloudinary voice messages to be fetched and played', () => {
    const deployment = JSON.parse(readFileSync(deploymentFile, 'utf8')) as {
      headers: Array<{
        headers: Array<{ key: string; value: string }>;
      }>;
    };
    const policy = deployment.headers
      .flatMap((entry) => entry.headers)
      .find((header) => header.key === 'Content-Security-Policy')?.value;

    expect(policy).toContain('connect-src');
    expect(policy).toContain('https://res.cloudinary.com');
    expect(policy).toMatch(/media-src[^;]*https:\/\/res\.cloudinary\.com/);
  });

  it('allows privacy-enhanced YouTube videos to play inside tracker pages', () => {
    const deployment = JSON.parse(readFileSync(deploymentFile, 'utf8')) as {
      headers: Array<{
        headers: Array<{ key: string; value: string }>;
      }>;
    };
    const policy = deployment.headers
      .flatMap((entry) => entry.headers)
      .find((header) => header.key === 'Content-Security-Policy')?.value;

    expect(policy).toMatch(/frame-src[^;]*https:\/\/www\.youtube-nocookie\.com/);
  });
});
