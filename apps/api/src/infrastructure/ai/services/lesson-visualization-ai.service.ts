import { dependencyFailure } from '../../../shared/errors/service.error';

import { economyAIStructuredWithFallback } from '../ai-fallback.helper';
import type { LessonVisualizationResult, IVisualizationInput } from '../ai.schemas';
import {
  buildVisualizationPrompt,
  LESSON_VISUALIZATION_SYSTEM_PROMPT,
} from '../prompts/lesson-visualization.prompt';

// ============================================================
// GEMINI — LESSON VISUALIZATION GENERATION
// ============================================================

export const generateLessonVisualization = async (
  lesson: IVisualizationInput
): Promise<LessonVisualizationResult> => {
  const html = await economyAIStructuredWithFallback(
    [
      { role: 'system', content: LESSON_VISUALIZATION_SYSTEM_PROMPT },
      { role: 'user', content: buildVisualizationPrompt(lesson) },
    ],
    (rawText) => {
      let parsedHtml = rawText
        .replace(/^```html\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const doctypeIndex = parsedHtml.search(/<!doctype html>/i);
      if (doctypeIndex > 0) parsedHtml = parsedHtml.slice(doctypeIndex);

      if (!parsedHtml.toLowerCase().includes('<canvas')) {
        throw dependencyFailure(
          'AI did not return a canvas visualization',
          'VISUALIZATION_NO_CANVAS'
        );
      }
      return parsedHtml;
    },
    'quality',
    'lesson_generation',
    { operation: 'lesson-visualization', groqMaxTokens: 8192, temperature: 0.4 }
  );

  return {
    html,
    visualTitle: `${lesson.title} — Visual`,
    visualDescription: `Interactive AI visualization of "${lesson.title}"`,
  };
};
