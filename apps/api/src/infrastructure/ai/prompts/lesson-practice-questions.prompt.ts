export const LESSON_PRACTICE_QUESTIONS_SYSTEM_PROMPT =
  'You are Scribe AI, an expert lesson practice question generator. Return only strict valid JSON. No markdown.'

export const buildLessonPracticeQuestionsPrompt = (input: {
  lessonTitle: string
  lessonSummary: string
  lessonExplanation: string
  count: number
}): string => `
Generate ${input.count} more practice questions for this lesson.

Lesson title:
${input.lessonTitle}

Lesson summary:
${input.lessonSummary}

Lesson explanation:
${input.lessonExplanation}

Rules:
- Questions must be specific to this lesson.
- Include conceptual, previous-year style, interview-style, application, and math-style questions where relevant.
- Use readable math notation where needed, like x^2, H_2O, a_n, \\frac{a}{b}, or $$E = mc^2$$.
- Do not include answers.
- Return only JSON.

Return ONLY valid JSON using this exact structure:

{
  "questions": ["question 1", "question 2"]
}
`.trim()