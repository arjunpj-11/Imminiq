import { describe, expect, it } from 'vitest';

import { createHttpUrlSchema } from '../../src/shared/validators/common.schemas';

describe('external HTTP URL validation', () => {
  const schema = createHttpUrlSchema();

  it.each(['https://example.com/path', 'http://localhost:3000/path'])('accepts %s', (value) => {
    expect(schema.parse(value)).toBe(value);
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'https://user:password@example.com/private',
  ])('rejects unsafe URL %s', (value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});
