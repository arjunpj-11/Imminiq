import { describe, expect, it } from 'vitest';

import { enforceRoadmapStructuralCompleteness } from '../../src/infrastructure/ai/services/roadmap-ai.service';

describe('roadmap structural evaluation', () => {
  it('caps a perfect AI score and suggests a child for every empty topic', () => {
    const result = enforceRoadmapStructuralCompleteness(
      {
        topics: [
          { title: 'Complete', children: [{ title: 'Child' }] },
          { title: 'Empty topic', children: [] },
        ],
      },
      { score: 100, grade: 'Excellent', summary: 'Perfect.', missingTopics: [] }
    );

    expect(result.score).toBe(84);
    expect(result.grade).toBe('Very Good');
    expect(result.missingTopics).toEqual([
      expect.objectContaining({ suggestedParentTitle: 'Empty topic' }),
    ]);
    expect(result.summary).toContain('no subtopics');
  });
});
