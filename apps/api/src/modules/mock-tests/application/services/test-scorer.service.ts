import { MockTestQuestion, MockTestAnswer } from '../../domain/types/mock-tests.types'

export interface ScoreResult {
  totalPoints: number
  earnedPoints: number
  scorePercentage: number
  correctCount: number
  incorrectCount: number
  skippedCount: number
  passed: boolean
}

export const calculateTestScore = (questions: MockTestQuestion[], answers: MockTestAnswer[], passingScore: number): ScoreResult => {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]))
  let totalPoints = 0
  let earnedPoints = 0
  let correctCount = 0
  let incorrectCount = 0
  let skippedCount = 0

  for (const question of questions) {
    totalPoints += question.points
    const answer = answerMap.get(question._id)
    if (!answer) { skippedCount++; continue }
    const points = answer.pointsEarned || 0
    earnedPoints += points
    if (points >= question.points) correctCount++
    else incorrectCount++
  }

  const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  return { totalPoints, earnedPoints, scorePercentage, correctCount, incorrectCount, skippedCount, passed: scorePercentage >= passingScore }
}

export const isMCQCorrect = (userAnswer: string, correctAnswer: string): boolean =>
  userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()

export const identifyWeakAndStrongTopics = (questions: MockTestQuestion[], answers: MockTestAnswer[]): { strongTopics: string[]; weakTopics: string[] } => {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]))
  const difficultyPerformance: Record<string, { correct: number; total: number }> = {}

  for (const question of questions) {
    const key = question.difficulty
    difficultyPerformance[key] ||= { correct: 0, total: 0 }
    difficultyPerformance[key].total++
    const answer = answerMap.get(question._id)
    if (answer && (answer.pointsEarned || 0) >= question.points) difficultyPerformance[key].correct++
  }

  const strongTopics: string[] = []
  const weakTopics: string[] = []
  for (const [difficulty, perf] of Object.entries(difficultyPerformance)) {
    const rate = perf.total > 0 ? perf.correct / perf.total : 0
    if (rate >= 0.7) strongTopics.push(difficulty)
    else weakTopics.push(difficulty)
  }
  return { strongTopics, weakTopics }
}

export const generateRecommendations = (scorePercentage: number, weakTopics: string[], passed: boolean): string[] => {
  const recommendations: string[] = []
  if (!passed) recommendations.push('Review missed questions and retake the test after focused practice.')
  if (weakTopics.includes('hard')) recommendations.push('Focus on advanced concepts and solve more hard-level timed questions.')
  if (weakTopics.includes('medium')) recommendations.push('Strengthen intermediate concepts before moving to harder tests.')
  if (scorePercentage < 50) recommendations.push('Revisit foundational subtopics before retaking this test.')
  else if (scorePercentage < 70) recommendations.push('Good progress. Practice more timed questions to improve speed.')
  else if (scorePercentage >= 90) recommendations.push('Excellent performance. Challenge yourself with a harder mock test.')
  return recommendations
}

export const sanitizeQuestionForAttempt = (q: MockTestQuestion) => ({
  _id: q._id,
  type: q.type,
  question: q.question,
  options: q.options,
  difficulty: q.difficulty,
  order: q.order,
  points: q.points,
})
