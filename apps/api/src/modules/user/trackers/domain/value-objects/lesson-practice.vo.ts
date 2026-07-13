export type LessonChatRole = 'user' | 'assistant';

export type GeneratedLessonPracticeTask = {
  title: string;
  description: string;
  starterCode?: string;
  expectedOutput?: string;
  expectedAnswer?: string;
};

export type GeneratedLessonData = {
  title: string;
  summary: string;
  explanation: string;
  insight: string;
  lessonType: 'concept' | 'coding' | 'interview' | 'system_design' | 'theory';
  compilerRuntime: 'javascript' | 'typescript' | 'python' | 'c++' | 'c' | 'java' | null;
  codeExample: {
    language: string;
    fileName: string;
    code: string;
  };
  practiceTask: GeneratedLessonPracticeTask;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
};

export type CodeSubmitInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  sourceCode: string;
  languageId?: number;
  language?: string;
  stdin?: string;
};

export type CodeSubmitResult = {
  isCorrect: boolean;
  expectedOutput: string;
  actualOutput: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: {
    id: number;
    description: string;
  };
  canCompareOptimized: boolean;
  canAskHints: boolean;
};

export type CodeHintInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  sourceCode: string;
  actualOutput?: string;
  errorOutput?: string;
  hintCount: number;
};

export type CodeHintResult = {
  mode: 'hint' | 'issue';
  hintCount: number;
  title: string;
  explanation: string;
};

export type OptimizedSolutionInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  sourceCode: string;
  language?: string;
};

export type OptimizedSolutionResult = {
  optimizedCode: string;
  explanation: string;
  improvements: string[];
};

export type VerifyLessonAnswerInput = {
  trackerId: string;
  subtopicId: string;
  userId: string;
  question: string;
  answer: string;
};

export type VerifyLessonAnswerResult = {
  verdict: 'correct' | 'partially_correct' | 'incorrect';
  score: number;
  feedback: string;
  correctedAnswer: string;
  keyPoints: string[];
};
