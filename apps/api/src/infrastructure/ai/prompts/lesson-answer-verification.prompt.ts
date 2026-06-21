export const LESSON_ANSWER_VERIFICATION_SYSTEM_PROMPT =
  'You are Scribe AI, a strict but supportive lesson-answer evaluator. Return only strict valid JSON. No markdown.'

export const buildLessonAnswerVerificationPrompt = (input: {
  lessonTitle: string
  lessonExplanation: string
  question: string
  expectedAnswer?: string
  userAnswer: string
}): string => `
Verify the learner's answer.

Lesson:
${input.lessonTitle}

Lesson explanation:
${input.lessonExplanation}

Question:
${input.question}

Reference answer:
${input.expectedAnswer || 'Not provided'}

Learner answer:
${input.userAnswer}

Return ONLY valid JSON using this exact structure:

{
  "verdict": "correct",
  "score": 0,
  "feedback": "short supportive feedback",
  "correctedAnswer": "a better complete answer",
  "keyPoints": ["key point 1", "key point 2", "key point 3"]
}

Rules:
- verdict must be one of: "correct", "partially_correct", "incorrect".
- score must be an integer from 0 to 100.
- If the answer is fully correct, still give a polished correctedAnswer.
- If the answer is weak, explain what is missing.
- Keep feedback simple and helpful.
`.trim()