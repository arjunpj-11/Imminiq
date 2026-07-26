import { describe, expect, it } from 'vitest';

import type { ITrackerClanMessage } from '../../../../../src/modules/user/trackers/types/tracker.types';
import { mergeGuildMessages } from '../../../../../src/modules/user/trackers/utils/merge-guild-messages';

const message = (id: string, count: number): ITrackerClanMessage => ({
  id,
  trackerId: 'tracker-1',
  text: 'Hi',
  kind: 'text',
  createdAt: '2026-07-26T10:00:00.000Z',
  user: { userId: 'user-1', name: 'User', username: 'user' },
  replyTo: null,
  reactions: count ? [{ emoji: '👍', count, reactedByViewer: count > 1, userIds: ['user-1'] }] : [],
});

describe('mergeGuildMessages', () => {
  it('lets a live socket update replace the stale history copy', () => {
    const result = mergeGuildMessages([message('message-1', 0)], [message('message-1', 2)]);

    expect(result).toHaveLength(1);
    expect(result[0]?.reactions[0]?.count).toBe(2);
  });
});
