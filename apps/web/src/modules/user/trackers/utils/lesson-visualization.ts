import type { IGeneratedLesson } from '../types/tracker.types';

const VISUAL_LESSON_PATTERNS = [
  /\b(flow|lifecycle|pipeline|request[- ]response|state machine)\b/i,
  /\b(dns|http|tcp|oauth|event loop|garbage collection)\b/i,
  /\b(sort|search|traversal|recursion|backtracking|dynamic programming)\b/i,
  /\b(linked list|tree|graph|stack|queue|heap|hash table|trie)\b/i,
  /\b(memory|pointer|paging|scheduling|semaphore|deadlock|circuit)\b/i,
  /\b(big[- ]?o|complexity curve|probability distribution|fourier|vector|matrix)\b/i,
  /\b(mvc|microservices?|architecture|design pattern|database index|joins?|transaction)\b/i,
  /\b(anatomy|orbit|ecosystem|food chain|water cycle|cell cycle|supply and demand)\b/i,
];

const TEXT_FIRST_LESSON_PATTERNS = [
  /\b(introduction|getting started|overview|definition|best practices?)\b/i,
  /\b(interview tips?|soft skills?|installation|setup|summary|conclusion)\b/i,
];

export const shouldOfferLessonVisualization = (
  lesson: Pick<IGeneratedLesson, 'lessonType' | 'tags' | 'title' | 'visualization'>
): boolean => {
  if (lesson.visualization) {
    return lesson.visualization.recommended && lesson.visualization.kind !== 'none';
  }

  const searchableText = `${lesson.title} ${lesson.tags.join(' ')}`.trim();

  if (
    !searchableText ||
    TEXT_FIRST_LESSON_PATTERNS.some((pattern) => pattern.test(searchableText))
  ) {
    return false;
  }

  return VISUAL_LESSON_PATTERNS.some((pattern) => pattern.test(searchableText));
};
