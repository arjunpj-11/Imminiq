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
  const evaluation = await trackerAIStructuredWithFallback(
    buildRoadmapEvaluationPrompt(roadmap),
    ROADMAP_EVALUATION_SYSTEM_PROMPT,
    cerebrasRoadmapEvaluationChat,
    (response) => parseAIJson(response, roadmapEvaluationSchema),
    'roadmap_evaluation',
    { operation: 'roadmap-evaluation', groqMaxTokens: 4096, temperature: 0.2 }
  );

  return enforceRoadmapStructuralCompleteness(roadmap, evaluation);
};

export const enforceRoadmapStructuralCompleteness = (
  roadmap: unknown,
  evaluation: RoadmapEvaluation
): RoadmapEvaluation => {
  if (!roadmap || typeof roadmap !== 'object' || !('topics' in roadmap)) return evaluation;

  const topics = Array.isArray((roadmap as { topics?: unknown }).topics)
    ? (roadmap as { topics: unknown[] }).topics
    : [];
  const emptyTopics = topics.filter((topic): topic is Record<string, unknown> => {
    if (!topic || typeof topic !== 'object' || Array.isArray(topic)) return false;
    const children = (topic as Record<string, unknown>).children;
    return !Array.isArray(children) || children.length === 0;
  });

  if (emptyTopics.length === 0) return evaluation;

  const missingTopics = [...evaluation.missingTopics];

  for (const topic of emptyTopics) {
    const parentTitle = typeof topic.title === 'string' ? topic.title.trim() : '';
    if (!parentTitle) continue;

    const alreadySuggested = missingTopics.some(
      (suggestion) => suggestion.suggestedParentTitle.trim().toLowerCase() === parentTitle.toLowerCase()
    );
    if (alreadySuggested) continue;

    missingTopics.push({
      title: `${parentTitle} fundamentals and practice`,
      description: `Learn the core concepts of ${parentTitle}, then apply them through a focused practical exercise.`,
      reason: `The “${parentTitle}” topic is empty. At least one concrete subtopic is required before this roadmap can be considered complete.`,
      suggestedParentTitle: parentTitle,
    });
  }

  const score = Math.min(evaluation.score, 84);
  const grade: RoadmapEvaluation['grade'] =
    score >= 90 ? 'Excellent' : score >= 75 ? 'Very Good' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';

  return {
    ...evaluation,
    score,
    grade,
    summary: `${evaluation.summary} ${emptyTopics.length} top-level topic${emptyTopics.length === 1 ? ' has' : 's have'} no subtopics and must be expanded.`,
    missingTopics,
  };
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
