export const LESSON_QUESTION_SOLUTION_SYSTEM_PROMPT =
  'You are Scribe AI, a clear and supportive lesson solution tutor.'

export const buildLessonQuestionSolutionPrompt = (input: {
  lessonTitle: string
  lessonExplanation: string
  question: string
}): string => `
Generate a clear solution/answer for this question.

Lesson title:
${input.lessonTitle}

Lesson explanation:
${input.lessonExplanation}

Question:
${input.question}

Rules:
- Answer in simple English.
- Make it useful for interview/exam preparation.
- Include key points the user should remember.
- If math is involved, format equations clearly using:
  - x^2 for powers
  - a_n for subscripts
  - \\frac{a}{b} for fractions
  - $$equation$$ for important standalone equations
- If relevant, include a short example.
`.trim()