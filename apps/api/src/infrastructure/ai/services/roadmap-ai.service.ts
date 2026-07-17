import {
  generatedRoadmapStructureSchema,
  roadmapEvaluationSchema,
  type GeneratedRoadmapStructure,
  type RoadmapEvaluation,
} from '../ai.schemas';
import { trackerAIStructuredWithFallback } from '../ai-fallback.helper';
import { parseAIJson } from '../ai-json.parser';
import {
  cerebrasRoadmapEvaluationChat,
  cerebrasRoadmapStructureChat,
} from '../clients/cerebras.client';
import {
  buildRoadmapEvaluationPrompt,
  buildCloneFreshnessEvaluationPrompt,
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
  level: 'beginner' | 'intermediate' | 'advanced',
  preferredLanguage = 'English'
): Promise<GeneratedRoadmapStructure> => {
  const roadmap = await trackerAIStructuredWithFallback(
    buildRoadmapStructurePrompt({
      topic,
      goal,
      level,
      preferredLanguage,
    }),
    ROADMAP_STRUCTURE_SYSTEM_PROMPT,
    cerebrasRoadmapStructureChat,
    (response) => parseAIJson(response, generatedRoadmapStructureSchema),
    'roadmap_generation',
    { operation: 'roadmap-generation', groqMaxTokens: 8192, temperature: 0.4 }
  );

  return {
    ...roadmap,
    title: normalizeTrackerTitle(roadmap.title, topic),
  };
};

export const evaluateRoadmap = async (roadmap: unknown): Promise<RoadmapEvaluation> => {
  return trackerAIStructuredWithFallback(
    buildRoadmapEvaluationPrompt(roadmap),
    ROADMAP_EVALUATION_SYSTEM_PROMPT,
    cerebrasRoadmapEvaluationChat,
    (response) => parseAIJson(response, roadmapEvaluationSchema),
    'roadmap_evaluation',
    { operation: 'roadmap-evaluation', groqMaxTokens: 4096, temperature: 0.2 }
  );
};

export const evaluateCloneFreshness = async (
  roadmap: unknown,
  sourceTrackerCreatedAt: string
): Promise<RoadmapEvaluation> => {
  return trackerAIStructuredWithFallback(
    buildCloneFreshnessEvaluationPrompt(roadmap, sourceTrackerCreatedAt),
    ROADMAP_EVALUATION_SYSTEM_PROMPT,
    cerebrasRoadmapEvaluationChat,
    (response) => parseAIJson(response, roadmapEvaluationSchema),
    'roadmap_evaluation',
    { operation: 'clone-freshness-evaluation', groqMaxTokens: 4096, temperature: 0.15 }
  );
};
