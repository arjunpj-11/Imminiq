import { ApiError } from '../../../shared/utils/ApiError'

import { heavyAIChatWithFallback } from '../ai-fallback.helper'
import type {
  LessonVisualizationResult,
  VisualizationInput,
} from '../ai.schemas'
import { cerebrasRoadmapStructureChat } from '../clients/cerebras.client'
import {
  buildVisualizationPrompt,
  LESSON_VISUALIZATION_SYSTEM_PROMPT,
} from '../prompts/lesson-visualization.prompt'

// ============================================================
// GEMINI — LESSON VISUALIZATION GENERATION
// ============================================================

export const generateLessonVisualization = async (
  lesson: VisualizationInput
): Promise<LessonVisualizationResult> => {
  const rawText = await heavyAIChatWithFallback(
    buildVisualizationPrompt(lesson),
    LESSON_VISUALIZATION_SYSTEM_PROMPT,
    cerebrasRoadmapStructureChat
  )

  if (!rawText) {
    throw new ApiError(
      502,
      'AI returned an empty response',
      'VISUALIZATION_EMPTY_RESPONSE'
    )
  }

  let html = rawText
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const doctypeIndex = html.search(/<!doctype html>/i)

  if (doctypeIndex > 0) {
    html = html.slice(doctypeIndex)
  }

  if (!html.toLowerCase().includes('<canvas')) {
    throw new ApiError(
      502,
      'AI did not return a canvas visualization. Please try regenerating.',
      'VISUALIZATION_NO_CANVAS'
    )
  }

  return {
    html,
    visualTitle: `${lesson.title} — Visual`,
    visualDescription: `Interactive AI visualization of "${lesson.title}"`,
  }
}