import { describe, expect, it } from 'vitest';

import { buildLessonGenerationPrompt } from '../../src/infrastructure/ai/prompts/lesson-generation.prompt';
import { buildRoadmapStructurePrompt } from '../../src/infrastructure/ai/prompts/roadmap-structure.prompt';
import { generateRoadmapSchema } from '../../src/modules/user/tracker-creation/presentation/tracker-creation.schema';

describe('tracker creation preferred language', () => {
  it('defaults older clients to English', () => {
    const result = generateRoadmapSchema.parse({
      topic: 'System design',
      goal: 'Prepare for interviews',
      level: 'intermediate',
    });

    expect(result.preferredLanguage).toBe('English');
  });

  it('instructs roadmap and lesson generation to use the selected language', () => {
    const roadmapPrompt = buildRoadmapStructurePrompt({
      topic: 'Data structures',
      level: 'beginner',
      preferredLanguage: 'Malayalam',
    });
    const lessonPrompt = buildLessonGenerationPrompt({
      trackerTitle: 'Data structures',
      subtopicTitle: 'Arrays',
      level: 'beginner',
      preferredLanguage: 'Malayalam',
    });

    expect(roadmapPrompt).toContain('Preferred Content Language: Malayalam');
    expect(roadmapPrompt).toContain('Write the tracker title');
    expect(lessonPrompt).toContain('Preferred content language:\nMalayalam');
    expect(lessonPrompt).toContain('Write all learner-facing explanations');
  });
});
