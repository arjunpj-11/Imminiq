import { ApiError } from '../../../shared/utils/ApiError'

import {
  answerVerificationSchema,
  codeHintSchema,
  lessonPracticeQuestionsSchema,
  optimizedSolutionSchema,
  type AnswerVerificationAIResult,
  type CodeHintAIResult,
  type LessonPracticeQuestionsAIResult,
  type OptimizedSolutionAIResult,
} from '../ai.schemas'
import { parseAIJson } from '../ai-json.parser'
import { groqChat } from '../clients/groq.client'
import {
  buildLessonAnswerVerificationPrompt,
  LESSON_ANSWER_VERIFICATION_SYSTEM_PROMPT,
} from '../prompts/lesson-answer-verification.prompt'
import {
  buildLessonCodeHintPrompt,
  LESSON_CODE_HINT_SYSTEM_PROMPT,
} from '../prompts/lesson-code-hint.prompt'
import {
  buildLessonOptimizedSolutionPrompt,
  LESSON_OPTIMIZED_SOLUTION_SYSTEM_PROMPT,
} from '../prompts/lesson-optimized-solution.prompt'
import {
  buildLessonPracticeQuestionsPrompt,
  LESSON_PRACTICE_QUESTIONS_SYSTEM_PROMPT,
} from '../prompts/lesson-practice-questions.prompt'
import {
  buildLessonQuestionSolutionPrompt,
  LESSON_QUESTION_SOLUTION_SYSTEM_PROMPT,
} from '../prompts/lesson-question-solution.prompt'
import {
  buildLessonSolutionDoubtPrompt,
  LESSON_SOLUTION_DOUBT_SYSTEM_PROMPT,
} from '../prompts/lesson-solution-doubt.prompt'

// ============================================================
// GROQ — LESSON PRACTICE AI HELPERS
// ============================================================

export const generateCodeHint = async (input: {
  lessonTitle: string
  practiceTitle: string
  practiceDescription: string
  expectedOutput: string
  sourceCode: string
  actualOutput?: string
  errorOutput?: string
  hintCount: number
}): Promise<CodeHintAIResult> => {
  const revealIssue = input.hintCount >= 3

  const response = await groqChat(
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
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty code hint response',
      'GROQ_EMPTY_CODE_HINT_RESPONSE'
    )
  }

  return parseAIJson(response, codeHintSchema)
}

export const generateOptimizedCodeSolution = async (input: {
  lessonTitle: string
  practiceTitle: string
  practiceDescription: string
  sourceCode: string
  language?: string
}): Promise<OptimizedSolutionAIResult> => {
  const response = await groqChat(
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
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty optimized solution response',
      'GROQ_EMPTY_OPTIMIZED_SOLUTION_RESPONSE'
    )
  }

  return parseAIJson(response, optimizedSolutionSchema)
}

export const verifyNonCodingAnswer = async (input: {
  lessonTitle: string
  lessonExplanation: string
  question: string
  expectedAnswer?: string
  userAnswer: string
}): Promise<AnswerVerificationAIResult> => {
  const response = await groqChat(
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
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty answer verification response',
      'GROQ_EMPTY_ANSWER_VERIFICATION_RESPONSE'
    )
  }

  return parseAIJson(response, answerVerificationSchema)
}

export const generateLessonPracticeQuestions = async (input: {
  lessonTitle: string
  lessonSummary: string
  lessonExplanation: string
  count?: number
}): Promise<LessonPracticeQuestionsAIResult> => {
  const count = input.count || 5

  const response = await groqChat(
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
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned empty lesson practice questions',
      'GROQ_EMPTY_LESSON_PRACTICE_QUESTIONS'
    )
  }

  return parseAIJson(response, lessonPracticeQuestionsSchema)
}

export const generateLessonQuestionSolution = async (input: {
  lessonTitle: string
  lessonExplanation: string
  question: string
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
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned empty question solution',
      'GROQ_EMPTY_QUESTION_SOLUTION'
    )
  }

  return response.trim()
}

export const chatWithLessonQuestionSolutionDoubt = async (input: {
  lessonTitle: string
  lessonExplanation: string
  question: string
  solution: string
  messages: {
    role: 'user' | 'assistant'
    content: string
  }[]
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
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned empty solution doubt response',
      'GROQ_EMPTY_SOLUTION_DOUBT_RESPONSE'
    )
  }

  return response.trim()
}