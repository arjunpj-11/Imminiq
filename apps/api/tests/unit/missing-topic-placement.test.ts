import { describe, expect, it } from 'vitest';

import {
  findBestMatchingParent,
  parseNewTopLevelPlacement,
} from '../../src/modules/user/trackers/application/missing-topic-placement.policy';

describe('missing topic placement policy', () => {
  it('matches normalized parent titles before using a soft match', () => {
    const topics = [
      { id: 'one', title: 'Data Structures & Algorithms' },
      { id: 'two', title: 'System Design' },
    ];

    expect(findBestMatchingParent(topics, 'data structures algorithms')).toBe(topics[0]);
  });

  it('parses a new top-level placement relative to an existing topic', () => {
    expect(
      parseNewTopLevelPlacement('New top level topic (should follow Data Structures)')
    ).toEqual({
      isNewTopLevel: true,
      relation: 'after',
      referenceTitle: 'Data Structures',
    });
  });

  it('matches parent titles even with leading topic numbers', () => {
    const topics = [
      { id: 'one', title: 'Exam Preparation & Mastery' },
      { id: 'two', title: 'System Design' },
    ];

    expect(findBestMatchingParent(topics, '8. Exam Preparation & Mastery')).toBe(topics[0]);
  });
});
