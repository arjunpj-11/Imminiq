import type { DifficultyLevel } from '../value-objects/difficulty-level.vo';
import type {
  MockTestPerformanceTrend,
  MockTestTopicBreakdown,
} from '../value-objects/mock-test-analytics.vo';
import type { MockTestCodingDetails } from '../value-objects/mock-test-coding.vo';
import type { QuestionType } from '../value-objects/question-type.vo';

export interface IGenerateQuestionsInput {
  topic: string;
  difficulty: DifficultyLevel;
  questionCount: number;
  questionTypes: QuestionType[];
}

export interface IEvaluateAnswerInput {
  question: string;
  correctAnswer?: string;
  userAnswer: string;
  questionType: QuestionType;
  maxPoints: number;
}

export interface IEvaluateAnswerOutput {
  score: number;
  feedback: string;
  isCorrect: boolean;
}

export interface IGenerateInsightsInput {
  userId: string;
  performanceTrends: MockTestPerformanceTrend[];
  topicBreakdown: MockTestTopicBreakdown[];
}

export type GeneratedMockTestQuestion = {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: DifficultyLevel;
  points: number;
  coding?: MockTestCodingDetails;
};

export interface IMockTestAIGateway {
  generateQuestions(input: IGenerateQuestionsInput): Promise<{
    title: string;
    description: string;
    questions: GeneratedMockTestQuestion[];
  }>;
  evaluateOpenAnswer(input: IEvaluateAnswerInput): Promise<IEvaluateAnswerOutput>;
  generatePerformanceInsights(input: IGenerateInsightsInput): Promise<string>;
}
