import { describe, expect, it } from 'vitest';

import { getChatDateLabel } from './chat-date-label';

describe('social chat date labels', () => {
  const now = new Date(2026, 6, 23, 14, 30);

  it('uses Today and Yesterday for recent messages', () => {
    expect(getChatDateLabel(new Date(2026, 6, 23, 8), now)).toBe('Today');
    expect(getChatDateLabel(new Date(2026, 6, 22, 20), now)).toBe('Yesterday');
  });

  it('uses weekday names within the current week and dates for older messages', () => {
    expect(getChatDateLabel(new Date(2026, 6, 21, 9), now)).toBe('Tuesday');
    expect(getChatDateLabel(new Date(2026, 6, 10, 9), now)).toBe('Jul 10');
    expect(getChatDateLabel(new Date(2025, 11, 31, 9), now)).toBe('Dec 31, 2025');
  });
});
