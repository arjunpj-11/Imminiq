import { describe, expect, it } from 'vitest';

import {
  clampProgress,
  normalizeProgressStepIndex,
} from '../../../../../src/modules/user/tracker-creation/utils/tracker-creation-progress';

describe('tracker creation progress', () => {
  it('falls back to the active phase when a background job returns invalid progress', () => {
    expect(clampProgress(Number.NaN, 35)).toBe(35);
    expect(clampProgress('N/A', 55)).toBe(55);
    expect(clampProgress(Number.POSITIVE_INFINITY, 75)).toBe(75);
  });

  it('keeps background progress and step indexes within their UI bounds', () => {
    expect(clampProgress(-1)).toBe(0);
    expect(clampProgress(108)).toBe(100);
    expect(normalizeProgressStepIndex(undefined, undefined, 80)).toBe(4);
  });
});
