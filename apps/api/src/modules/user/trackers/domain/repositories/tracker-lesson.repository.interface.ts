import type { GeneratedLessonPracticeTask } from '../lesson-practice.types';
import type { GeneratedTrackerLessonRecord } from '../trackers.types';
import type { AnswerVerificationResult } from '../services/tracker-ai.interface';

export type TrackerLessonType = 'concept' | 'coding' | 'interview' | 'system_design' | 'theory';

export type TrackerLessonCompilerRuntime =
  'javascript' | 'typescript' | 'python' | 'c++' | 'c' | 'java' | null;

export type TrackerLessonDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type TrackerLessonCodeExample = {
  language: string;
  fileName: string;
  code: string;
};

export type CreateTrackerLessonInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  title: string;
  summary: string;
  explanation: string;
  insight: string;
  lessonType: TrackerLessonType;
  compilerRuntime: TrackerLessonCompilerRuntime;
  codeExample: TrackerLessonCodeExample;
  practiceTask: GeneratedLessonPracticeTask;
  tags: string[];
  difficulty: TrackerLessonDifficulty;
};

export type LessonChatScope = 'lesson_doubt_chat' | 'question_solution_chat';

export type GetLessonChatMessagesInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  scope?: LessonChatScope;
  questionId?: string | null;
};

export type CreateLessonChatMessageInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  lessonId?: string | null;
  scope?: LessonChatScope;
  questionId?: string | null;
  role: 'user' | 'assistant';
  content: string;
};

export type GetLessonAnswerAttemptsInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  questionId?: string | null;
};

export type CreateLessonAnswerAttemptInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  lessonId?: string | null;
  questionId?: string | null;
  question: string;
  answer: string;
  feedback: AnswerVerificationResult;
  isCorrect: boolean;
  score: number;
};

export type LessonCodeAction = 'run' | 'submit';

export type LessonExecutionStatus = {
  id?: number;
  description?: string;
};

export type GetLessonCodeSubmissionsInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  action?: LessonCodeAction;
};

export type CreateLessonCodeSubmissionInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  lessonId?: string | null;
  questionId?: string | null;
  action: LessonCodeAction;
  language: string;
  languageId?: number | null;
  sourceCode: string;
  stdin?: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  message?: string;
  status?: LessonExecutionStatus | null;
  time?: string | null;
  memory?: number | null;
  isCorrect?: boolean;
  expectedOutput?: string;
  actualOutput?: string;
  feedback?: string;
};

export type GetLessonGeneratedQuestionsInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
};

export type LessonGeneratedQuestionInput = {
  question: string;
  questionHash: string;
  source?: 'base' | 'ai_generated';
};

export type CreateLessonGeneratedQuestionsInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  lessonId?: string | null;
  questions: LessonGeneratedQuestionInput[];
};

export type FindLessonQuestionSolutionInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  questionHash: string;
};

export type CreateLessonQuestionSolutionInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  lessonId?: string | null;
  question: string;
  questionHash: string;
  solution: string;
};

export type GetLessonQuestionSolutionDoubtsInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  questionHash: string;
};

export type CreateLessonQuestionSolutionDoubtInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  lessonId?: string | null;
  solutionId?: string | null;
  question: string;
  questionHash: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ClearLessonChatMessagesInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
};

export type ClearLessonQuestionSolutionDoubtsInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  questionHash: string;
};

export type FindLessonVisualizationInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
};

export type LessonVisualizationRecord = {
  html: string;
  visualTitle: string;
  visualDescription: string;
};

export type LessonRecordId = string;

export type LessonMutationResult = {
  acknowledged?: boolean;
  matchedCount?: number;
  modifiedCount?: number;
};

export type LessonChatMessageRecord = {
  _id: LessonRecordId;
  role: 'user' | 'assistant';
  content: string;
  scope: LessonChatScope;
  questionId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type LessonAnswerAttemptRecord = {
  _id: LessonRecordId;
  question: string;
  answer: string;
  feedback: AnswerVerificationResult;
  isCorrect: boolean;
  score: number;
  attemptNumber?: number;
  createdAt?: Date;
};

export type LessonCodeSubmissionRecord = {
  _id: LessonRecordId;
  action: LessonCodeAction;
  language: string;
  languageId?: number | null;
  sourceCode: string;
  stdin?: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  message?: string;
  status?: LessonExecutionStatus | null;
  time?: string | null;
  memory?: number | null;
  isCorrect?: boolean;
  expectedOutput?: string;
  actualOutput?: string;
  feedback?: string;
  createdAt?: Date;
};

export type LessonGeneratedQuestionRecord = {
  _id: LessonRecordId;
  question: string;
  questionHash: string;
  source: 'base' | 'ai_generated';
  createdAt?: Date;
};

export type LessonQuestionSolutionRecord = {
  _id: LessonRecordId;
  question: string;
  questionHash: string;
  solution: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type LessonQuestionSolutionDoubtRecord = {
  _id: LessonRecordId;
  question: string;
  questionHash: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
};

export type SaveLessonVisualizationInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  lessonId?: string | null;
  html: string;
  visualTitle: string;
  visualDescription: string;
};

export interface ITrackerLessonContentRepository {
  createLesson(data: CreateTrackerLessonInput): Promise<GeneratedTrackerLessonRecord>;
}

export interface ITrackerLessonChatRepository {
  getLessonChatMessages(data: GetLessonChatMessagesInput): Promise<LessonChatMessageRecord[]>;

  createLessonChatMessage(data: CreateLessonChatMessageInput): Promise<LessonChatMessageRecord>;

  clearLessonChatMessages(data: ClearLessonChatMessagesInput): Promise<LessonMutationResult>;

  getLessonQuestionSolutionDoubts(
    data: GetLessonQuestionSolutionDoubtsInput
  ): Promise<LessonQuestionSolutionDoubtRecord[]>;

  createLessonQuestionSolutionDoubt(
    data: CreateLessonQuestionSolutionDoubtInput
  ): Promise<LessonQuestionSolutionDoubtRecord>;

  clearLessonQuestionSolutionDoubts(
    data: ClearLessonQuestionSolutionDoubtsInput
  ): Promise<LessonMutationResult>;
}

export interface ITrackerLessonPracticeRepository {
  getLessonAnswerAttempts(data: GetLessonAnswerAttemptsInput): Promise<LessonAnswerAttemptRecord[]>;

  createLessonAnswerAttempt(
    data: CreateLessonAnswerAttemptInput
  ): Promise<LessonAnswerAttemptRecord>;

  getLessonGeneratedQuestions(
    data: GetLessonGeneratedQuestionsInput
  ): Promise<LessonGeneratedQuestionRecord[]>;

  createLessonGeneratedQuestions(
    data: CreateLessonGeneratedQuestionsInput
  ): Promise<LessonGeneratedQuestionRecord[]>;

  findLessonQuestionSolution(
    data: FindLessonQuestionSolutionInput
  ): Promise<LessonQuestionSolutionRecord | null>;

  createLessonQuestionSolution(
    data: CreateLessonQuestionSolutionInput
  ): Promise<LessonQuestionSolutionRecord>;
}

export interface ITrackerLessonCodeRepository {
  getLessonCodeSubmissions(
    data: GetLessonCodeSubmissionsInput
  ): Promise<LessonCodeSubmissionRecord[]>;

  createLessonCodeSubmission(
    data: CreateLessonCodeSubmissionInput
  ): Promise<LessonCodeSubmissionRecord>;
}

export interface ITrackerLessonVisualizationRepository {
  findLessonVisualization(
    data: FindLessonVisualizationInput
  ): Promise<LessonVisualizationRecord | null>;

  saveLessonVisualization(data: SaveLessonVisualizationInput): Promise<LessonVisualizationRecord>;
}

export interface ITrackerLessonRepository
  extends
    ITrackerLessonContentRepository,
    ITrackerLessonChatRepository,
    ITrackerLessonPracticeRepository,
    ITrackerLessonCodeRepository,
    ITrackerLessonVisualizationRepository {}
