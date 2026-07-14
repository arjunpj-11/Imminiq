import { describe, expect, it } from 'vitest';

import { normalizeTrackerTitle } from '../../src/infrastructure/ai/services/roadmap-ai.service';

describe('generated tracker titles', () => {
  it('removes generic roadmap marketing language', () => {
    expect(
      normalizeTrackerTitle(
        'Physics for 10th CBSE Board Exam: Zero-to-Hero Mastery Roadmap',
        'Physics for 10th CBSE Board Exam'
      )
    ).toBe('Physics for 10th CBSE Board Exam');

    expect(
      normalizeTrackerTitle('Zero-to-Hero JEE Mathematics Master Roadmap', 'Mathematics for JEE')
    ).toBe('JEE Mathematics');
  });

  it('falls back to the requested subject when the generated title is generic', () => {
    expect(
      normalizeTrackerTitle('The Ultimate Mastery Roadmap', 'React Interview Preparation')
    ).toBe('React Interview Preparation');
  });
});
