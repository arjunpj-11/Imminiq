import { describe, expect, it } from 'vitest';
import { parsePaginationConfig } from '../../src/config/pagination';

describe('parsePaginationConfig', () => {
  it('provides safe production defaults', () => {
    expect(parsePaginationConfig({})).toEqual({
      defaultLimit: 20,
      profileLimit: 10,
      compactLimit: 6,
      gridLimit: 12,
      adminLimit: 25,
      batchLimit: 50,
      messageLimit: 60,
      lookupLimit: 100,
      dashboardBattleLimit: 3,
      dashboardFriendLimit: 4,
      profileHighlightLimit: 3,
    });
  });

  it('accepts deploy-time overrides', () => {
    expect(
      parsePaginationConfig({
        VITE_PAGINATION_DEFAULT_LIMIT: '24',
        VITE_PAGINATION_MESSAGE_LIMIT: '80',
      })
    ).toMatchObject({
      defaultLimit: 24,
      messageLimit: 80,
    });
  });

  it.each(['0', '-1', '3.5', 'not-a-number', '101'])(
    'rejects an unsafe lookup limit: %s',
    (value) => {
      expect(() => parsePaginationConfig({ VITE_PAGINATION_LOOKUP_LIMIT: value })).toThrow();
    }
  );
});
