export const buildMockTestAnswerEvaluationPrompt = (input: {
  question: string
  correctAnswer?: string
  userAnswer: string
  maxPoints: number
}): string => `Score this answer and return ONLY valid JSON.

Question: ${input.question}
${input.correctAnswer ? `Expected answer: ${input.correctAnswer}` : ''}
Student answer: ${input.userAnswer}
Max points: ${input.maxPoints}

Return {
  "score": number,
  "isCorrect": boolean,
  "feedback": "brief feedback"
}`