import { describe, expect, it } from 'vitest';

import { buildTrackerClanChallengePrompt } from '../../src/infrastructure/ai/prompts/tracker-clan-challenge.prompt';

describe('tracker guild challenge prompt', () => {
  it('requests real JEE-style subject questions and forbids roadmap metadata questions', () => {
    const prompt = buildTrackerClanChallengePrompt({
      trackerTitle: 'JEE Mathematics',
      trackerDescription: 'Advanced preparation for JEE Main and Advanced',
      category: 'Competitive exams',
      field: 'Mathematics',
      goal: 'Master JEE mathematics problem solving',
      level: 'advanced',
      contentLanguage: 'English',
      questionCount: 10,
      durationMinutes: 20,
      topics: [
        {
          title: 'Calculus',
          description: 'Limits, derivatives, and integrals',
          subtopics: [{ title: 'Definite integration', description: 'Properties and applications' }],
        },
      ],
    });

    expect(prompt).toContain('Generate exactly 10 multiple-choice questions');
    expect(prompt).toContain('If it indicates JEE, generate authentic JEE-style questions');
    expect(prompt).toContain('Never ask "which topic includes"');
    expect(prompt).toContain('Test actual subject knowledge and problem solving');
    expect(prompt).toContain('Definite integration');
  });
});
