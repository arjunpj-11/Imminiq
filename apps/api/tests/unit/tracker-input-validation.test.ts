import { describe, expect, it } from 'vitest';

import {
  createTrackerSchema,
  importTrackerOutlineSchema,
} from '../../src/modules/user/trackers/presentation/trackers.schema';

describe('tracker input validation', () => {
  it('accepts a specific learning title and rejects placeholders or template syntax', () => {
    expect(createTrackerSchema.safeParse({ title: 'React performance' }).success).toBe(true);
    expect(createTrackerSchema.safeParse({ title: 'random thing' }).success).toBe(false);
    expect(createTrackerSchema.safeParse({ title: '{{constructor}}' }).success).toBe(false);
  });

  it('rejects unknown object fields instead of silently accepting them', () => {
    expect(
      createTrackerSchema.safeParse({
        title: 'Distributed systems',
        $where: 'unsafe',
      }).success
    ).toBe(false);
    expect(
      importTrackerOutlineSchema.safeParse({
        kind: 'topics',
        topics: [{ title: 'Consensus', subtopics: [], constructor: {} }],
      }).success
    ).toBe(false);
  });

  it('retains bounded recursive outline validation', () => {
    expect(
      importTrackerOutlineSchema.safeParse({
        kind: 'topics',
        topics: [{ title: 'Consensus', subtopics: [{ title: 'Raft', subtopics: [] }] }],
      }).success
    ).toBe(true);
  });
});
