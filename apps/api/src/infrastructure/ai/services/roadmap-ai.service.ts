import {
  generatedRoadmapStructureSchema,
  roadmapEvaluationSchema,
  type GeneratedRoadmapStructure,
  type RoadmapEvaluation,
} from '../ai.schemas';
import { trackerAIChatWithFallback } from '../ai-fallback.helper';
import { parseAIJson } from '../ai-json.parser';
import {
  cerebrasRoadmapEvaluationChat,
  cerebrasRoadmapStructureChat,
} from '../clients/cerebras.client';
import {
  buildRoadmapEvaluationPrompt,
  ROADMAP_EVALUATION_SYSTEM_PROMPT,
} from '../prompts/roadmap-evaluation.prompt';
import {
  buildRoadmapStructurePrompt,
  ROADMAP_STRUCTURE_SYSTEM_PROMPT,
} from '../prompts/roadmap-structure.prompt';

export const normalizeTrackerTitle = (generatedTitle: string, requestedTopic: string) => {
  const cleanedTitle = generatedTitle
    .replace(/\bzero\s*[-–—]?\s*to\s*[-–—]?\s*hero\b/gi, '')
    .replace(/\b(complete|ultimate|mastery|master|roadmap|learning path|journey)\b/gi, '')
    .replace(/^\s*tracker\s*:\s*/i, '')
    .replace(/\s*[:|–—-]\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const isOnlyArticle = /^(?:a|an|the)$/i.test(cleanedTitle);
  return cleanedTitle.length >= 3 && !isOnlyArticle ? cleanedTitle : requestedTopic.trim();
};

// ============================================================
// GEMINI / CEREBRAS — COMPLEX ROADMAP GENERATION
// ============================================================

export const generateRoadmapStructure = async (
  topic: string,
  goal: string | undefined,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<GeneratedRoadmapStructure> => {
  const response = await trackerAIChatWithFallback(
    buildRoadmapStructurePrompt({
      topic,
      goal,
      level,
    }),
    ROADMAP_STRUCTURE_SYSTEM_PROMPT,
    cerebrasRoadmapStructureChat
  );

  const roadmap = parseAIJson(response, generatedRoadmapStructureSchema);

  return {
    ...roadmap,
    title: normalizeTrackerTitle(roadmap.title, topic),
  };
};

export const evaluateRoadmap = async (roadmap: unknown): Promise<RoadmapEvaluation> => {
  const response = await trackerAIChatWithFallback(
    buildRoadmapEvaluationPrompt(roadmap),
    ROADMAP_EVALUATION_SYSTEM_PROMPT,
    cerebrasRoadmapEvaluationChat
  );

  return parseAIJson(response, roadmapEvaluationSchema);
};
