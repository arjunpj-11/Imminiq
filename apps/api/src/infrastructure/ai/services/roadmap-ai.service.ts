import {
  generatedRoadmapStructureSchema,
  roadmapEvaluationSchema,
  type GeneratedRoadmapStructure,
  type RoadmapEvaluation,
} from '../ai.schemas'
import { heavyAIChatWithFallback } from '../ai-fallback.helper'
import { parseAIJson } from '../ai-json.parser'
import {
  cerebrasRoadmapEvaluationChat,
  cerebrasRoadmapStructureChat,
} from '../clients/cerebras.client'
import {
  buildRoadmapEvaluationPrompt,
  ROADMAP_EVALUATION_SYSTEM_PROMPT,
} from '../prompts/roadmap-evaluation.prompt'
import {
  buildRoadmapStructurePrompt,
  ROADMAP_STRUCTURE_SYSTEM_PROMPT,
} from '../prompts/roadmap-structure.prompt'

// ============================================================
// GEMINI / CEREBRAS — COMPLEX ROADMAP GENERATION
// ============================================================

export const generateRoadmapStructure = async (
  topic: string,
  goal: string | undefined,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<GeneratedRoadmapStructure> => {
  const response = await heavyAIChatWithFallback(
    buildRoadmapStructurePrompt({
      topic,
      goal,
      level,
    }),
    ROADMAP_STRUCTURE_SYSTEM_PROMPT,
    cerebrasRoadmapStructureChat
  )

  return parseAIJson(
    response,
    generatedRoadmapStructureSchema
  )
}

export const evaluateRoadmap = async (
  roadmap: unknown
): Promise<RoadmapEvaluation> => {
  const response = await heavyAIChatWithFallback(
    buildRoadmapEvaluationPrompt(roadmap),
    ROADMAP_EVALUATION_SYSTEM_PROMPT,
    cerebrasRoadmapEvaluationChat
  )

  return parseAIJson(
    response,
    roadmapEvaluationSchema
  )
}