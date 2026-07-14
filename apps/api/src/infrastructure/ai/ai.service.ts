export { generateRoadmapStructure, evaluateRoadmap } from './services/roadmap-ai.service';

export { generateLesson, chatWithLessonTutor } from './services/lesson-ai.service';

export {
  generateCodeHint,
  generateOptimizedCodeSolution,
  verifyNonCodingAnswer,
  generateLessonPracticeQuestions,
  generateLessonQuestionSolution,
  chatWithLessonQuestionSolutionDoubt,
} from './services/lesson-practice-ai.service';

export { generateLessonVisualization } from './services/lesson-visualization-ai.service';

export {
  verifyTrackerTopic,
  verifyTrackerSubtopic,
} from './services/tracker-verification-ai.service';

export {
  generateRoadmap,
  detectMissingTopics,
  analyzeTestPerformance,
  generateDashboardInsights,
  chatWithTutor,
  explainTopic,
  explainELI5,
  generateMockQuestions,
  reviewCode,
  optimizeCode,
  simplifyLesson,
  generateCodeExample,
  quickSummary,
  generateTopicTags,
} from './services/general-ai.service';

export type {
  RoadmapNestedNode,
  GeneratedRoadmapStructure,
  RoadmapEvaluation,
  GeneratedLesson,
  CodeHintAIResult,
  OptimizedSolutionAIResult,
  AnswerVerificationAIResult,
  LessonPracticeQuestionsAIResult,
  TrackerTopicVerificationResult,
  TrackerSubtopicVerificationResult,
  LessonVisualizationResult,
  IVisualizationInput,
} from './ai.schemas';

export {
  evaluateMockTestOpenAnswerAI,
  generateMockTestPerformanceInsightsAI,
  generateMockTestQuestionsAI,
  generateMockTestQuestionsGroqAI,
} from './services/mock-test-ai.service';

export type {
  EvaluateMockTestOpenAnswerAIInput,
  EvaluateMockTestOpenAnswerAIOutput,
  GenerateMockTestPerformanceInsightsAIInput,
  GenerateMockTestQuestionsAIInput,
  GenerateMockTestQuestionsAIOutput,
  MockTestAICodingLanguage,
  MockTestAIDifficulty,
  MockTestAIQuestionType,
} from './services/mock-test-ai.service';
