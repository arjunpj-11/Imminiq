import { describe, expect, it } from 'vitest';

import { calculateVoiceDurationSeconds } from './voice-recording-duration';

describe('calculateVoiceDurationSeconds', () => {
  it('uses the actual elapsed recording time', () => {
    expect(calculateVoiceDurationSeconds(4_120)).toBe(4);
    expect(calculateVoiceDurationSeconds(4_780)).toBe(5);
  });

  it('keeps the duration inside the supported recording range', () => {
    expect(calculateVoiceDurationSeconds(120)).toBe(1);
    expect(calculateVoiceDurationSeconds(900_000)).toBe(600);
  });
});
