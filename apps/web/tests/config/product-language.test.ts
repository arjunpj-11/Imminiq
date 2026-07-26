import { describe, expect, it } from 'vitest';
import { PRODUCT_LANGUAGE, formatProductLabel } from '../../src/config/product-language';

describe('product language', () => {
  it('keeps the canonical names used across learner and admin surfaces', () => {
    expect(PRODUCT_LANGUAGE).toMatchObject({
      assistant: 'Ask Immi',
      guild: 'Guild',
      tracker: 'Tracker',
      verificationQueue: 'Verification Queue',
    });
  });

  it('translates internal states into user-facing labels', () => {
    expect(formatProductLabel('paused')).toBe('Suspended');
    expect(formatProductLabel('under_review')).toBe('Under review');
    expect(formatProductLabel('in_progress')).toBe('In progress');
  });

  it('formats unknown internal identifiers without exposing underscores', () => {
    expect(formatProductLabel('awaiting_documents')).toBe('Awaiting Documents');
  });
});
