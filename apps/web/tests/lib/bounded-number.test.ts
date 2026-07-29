import { describe, expect, it } from 'vitest';

import { boundedInteger, normalizePercentage } from '../../src/lib/bounded-number';

describe('bounded numbers', () => {
  it('bounds integer inputs', () => {
    expect(boundedInteger('7.8', 1, 10)).toBe(7);
    expect(boundedInteger(20, 1, 10)).toBe(10);
    expect(boundedInteger('invalid', 1, 10)).toBe(1);
  });

  it('normalizes percentages from persisted and API values', () => {
    expect(normalizePercentage('42.6')).toBe(43);
    expect(normalizePercentage(-10)).toBe(0);
    expect(normalizePercentage(120)).toBe(100);
  });

  it('uses a safe fallback for non-finite percentages', () => {
    expect(normalizePercentage(Number.NaN)).toBe(0);
    expect(normalizePercentage(Number.POSITIVE_INFINITY, 8)).toBe(8);
    expect(normalizePercentage('N/A', 12)).toBe(12);
    expect(normalizePercentage(undefined, Number.NaN)).toBe(0);
  });
});
