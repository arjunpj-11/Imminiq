import { describe, expect, it } from 'vitest';
import { formatMathTextToHtml } from '../../../../../src/modules/user/trackers/utils/lesson-content.utils';

describe('formatMathTextToHtml', () => {
  it('escapes untrusted HTML before applying the supported math markup', () => {
    const html = formatMathTextToHtml(
      '<img src=x onerror=alert(1)> <script>alert(2)</script> \\(x^2\\)'
    );

    expect(html).not.toContain('<img');
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;img');
    expect(html).toContain('<sup>2</sup>');
  });
});
