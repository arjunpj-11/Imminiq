import { describe, expect, it } from 'vitest';

import { shouldOfferLessonVisualization } from '../../../../../src/modules/user/trackers/utils/lesson-visualization';

const lesson = {
  lessonType: 'concept' as const,
  tags: [] as string[],
  title: 'A lesson',
};

describe('shouldOfferLessonVisualization', () => {
  it('uses the lesson recommendation when it is available', () => {
    expect(
      shouldOfferLessonVisualization({
        ...lesson,
        visualization: {
          recommended: true,
          kind: 'process',
          reason: 'The request moves through clear steps.',
        },
      })
    ).toBe(true);
  });

  it('hides the action when the lesson explicitly rejects visualization', () => {
    expect(
      shouldOfferLessonVisualization({
        ...lesson,
        title: 'Binary search',
        visualization: {
          recommended: false,
          kind: 'none',
          reason: 'The lesson is clearer in code.',
        },
      })
    ).toBe(false);
  });

  it.each(['Binary search', 'DNS request flow', 'Linked list traversal', 'The water cycle'])(
    'supports a clearly visual legacy lesson: %s',
    (title) => {
      expect(shouldOfferLessonVisualization({ ...lesson, title })).toBe(true);
    }
  );

  it.each(['Introduction to JavaScript', 'Interview tips', 'Clean code principles'])(
    'hides a text-first legacy lesson: %s',
    (title) => {
      expect(shouldOfferLessonVisualization({ ...lesson, title })).toBe(false);
    }
  );
});
