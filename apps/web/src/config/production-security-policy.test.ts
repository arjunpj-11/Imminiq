import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('production content security policy', () => {
  it('allows Cloudinary voice messages to be fetched and played', () => {
    const deployment = JSON.parse(
      readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')
    ) as {
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
});
