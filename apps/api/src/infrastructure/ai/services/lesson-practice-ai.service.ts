import { dependencyFailure } from '../../../shared/errors/service.error';

import {
  answerVerificationSchema,
  codeHintSchema,
  lessonPracticeQuestionsSchema,
  optimizedSolutionSchema,
  type AnswerVerificationAIResult,
  type CodeHintAIResult,
  type LessonPracticeQuestionsAIResult,
  type OptimizedSolutionAIResult,
} from '../ai.schemas';
import { parseAIJson } from '../ai-json.parser';
import {
  economyAIChatWithFallback as groqChat,
  economyAIStructuredWithFallback,
} from '../ai-fallback.helper';
import {
  buildLessonAnswerVerificationPrompt,
  LESSON_ANSWER_VERIFICATION_SYSTEM_PROMPT,
} from '../prompts/lesson-answer-verification.prompt';
import {
  buildLessonCodeHintPrompt,
  LESSON_CODE_HINT_SYSTEM_PROMPT,
} from '../prompts/lesson-code-hint.prompt';
import {
  buildLessonOptimizedSolutionPrompt,
  LESSON_OPTIMIZED_SOLUTION_SYSTEM_PROMPT,
} from '../prompts/lesson-optimized-solution.prompt';
import {
  buildLessonPracticeQuestionsPrompt,
  LESSON_PRACTICE_QUESTIONS_SYSTEM_PROMPT,
} from '../prompts/lesson-practice-questions.prompt';
import {
  buildLessonQuestionSolutionPrompt,
  LESSON_QUESTION_SOLUTION_SYSTEM_PROMPT,
} from '../prompts/lesson-question-solution.prompt';
import {
  buildLessonSolutionDoubtPrompt,
  LESSON_SOLUTION_DOUBT_SYSTEM_PROMPT,
} from '../prompts/lesson-solution-doubt.prompt';

// ============================================================
// GROQ — LESSON PRACTICE AI HELPERS
// ============================================================

export const generateCodeHint = async (input: {
  lessonTitle: string;
  practiceTitle: string;
  practiceDescription: string;
  expectedOutput: string;
  sourceCode: string;
  actualOutput?: string;
  errorOutput?: string;
  hintCount: number;
}): Promise<CodeHintAIResult> => {
  const revealIssue = input.hintCount >= 3;

  return economyAIStructuredWithFallback(
    [
      {
        role: 'system',
        content: LESSON_CODE_HINT_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildLessonCodeHintPrompt({
          ...input,
          revealIssue,
        }),
      },
    ],
    (response) => parseAIJson(response, codeHintSchema),
    'quality',
    'lesson_practice',
    { operation: 'lesson-code-hint', temperature: 0.3 }
  );
};

export const generateOptimizedCodeSolution = async (input: {
  lessonTitle: string;
  practiceTitle: string;
  practiceDescription: string;
  sourceCode: string;
  language?: string;
}): Promise<OptimizedSolutionAIResult> => {
  return economyAIStructuredWithFallback(
    [
      {
        role: 'system',
        content: LESSON_OPTIMIZED_SOLUTION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildLessonOptimizedSolutionPrompt(input),
      },
    ],
    (response) => parseAIJson(response, optimizedSolutionSchema),
    'quality',
    'lesson_practice',
    { operation: 'lesson-optimized-solution', groqMaxTokens: 4096, temperature: 0.2 }
  );
};

export const verifyNonCodingAnswer = async (input: {
  lessonTitle: string;
  lessonExplanation: string;
  question: string;
  expectedAnswer?: string;
  userAnswer: string;
}): Promise<AnswerVerificationAIResult> => {
  return economyAIStructuredWithFallback(
    [
      {
        role: 'system',
        content: LESSON_ANSWER_VERIFICATION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildLessonAnswerVerificationPrompt(input),
      },
    ],
    (response) => parseAIJson(response, answerVerificationSchema),
    'quality',
    'lesson_practice',
    { operation: 'lesson-answer-verification', temperature: 0.1 }
  );
};

export const generateLessonPracticeQuestions = async (input: {
  lessonTitle: string;
  lessonSummary: string;
  lessonExplanation: string;
  count?: number;
}): Promise<LessonPracticeQuestionsAIResult> => {
  const count = input.count || 5;

  return economyAIStructuredWithFallback(
    [
      {
        role: 'system',
        content: LESSON_PRACTICE_QUESTIONS_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildLessonPracticeQuestionsPrompt({
          ...input,
          count,
        }),
      },
    ],
    (response) => parseAIJson(response, lessonPracticeQuestionsSchema),
    'quality',
    'lesson_practice',
    { operation: 'lesson-practice-questions', groqMaxTokens: 4096, temperature: 0.4 }
  );
};

export const generateLessonQuestionSolution = async (input: {
  lessonTitle: string;
  lessonExplanation: string;
  question: string;
}): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content: LESSON_QUESTION_SOLUTION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildLessonQuestionSolutionPrompt(input),
      },
    ],
    'quality',
    'lesson_practice',
    { operation: 'lesson-question-solution' }
  );

  if (!response) {
    throw dependencyFailure(
      'Groq returned empty question solution',
      'GROQ_EMPTY_QUESTION_SOLUTION'
    );
  }

  return response.trim();
};

export const chatWithLessonQuestionSolutionDoubt = async (input: {
  lessonTitle: string;
  lessonExplanation: string;
  question: string;
  solution: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'system',
        content: LESSON_SOLUTION_DOUBT_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildLessonSolutionDoubtPrompt({
          lessonTitle: input.lessonTitle,
          lessonExplanation: input.lessonExplanation,
          question: input.question,
          solution: input.solution,
        }),
      },
      ...input.messages,
    ],
    'quality',
    'lesson_practice',
    { operation: 'lesson-solution-doubt-chat' }
  );

  if (!response) {
    throw dependencyFailure(
      'Groq returned empty solution doubt response',
      'GROQ_EMPTY_SOLUTION_DOUBT_RESPONSE'
    );
  }

  return response.trim();
};
