import type { MockTestAnswerEntity } from '../../domain/entities/mock-test-answer.entity'
import type { MockTestQuestionEntity } from '../../domain/entities/mock-test-question.entity'

export interface ScoreResult {
  totalPoints: number
  earnedPoints: number
  scorePercentage: number
  correctCount: number
  incorrectCount: number
  skippedCount: number
  passed: boolean
}

export interface MockTestScorerContract {
  calculateTestScore(questions: MockTestQuestionEntity[], answers: MockTestAnswerEntity[], passingScore: number): ScoreResult
  isMCQCorrect(userAnswer: string, correctAnswer: string): boolean
  identifyWeakAndStrongTopics(questions: MockTestQuestionEntity[], answers: MockTestAnswerEntity[]): { strongTopics: string[]; weakTopics: string[] }
  generateRecommendations(scorePercentage: number, weakTopics: string[], passed: boolean): string[]
}

export class MockTestScorer implements MockTestScorerContract {
  calculateTestScore(
    questions: MockTestQuestionEntity[],
    answers: MockTestAnswerEntity[],
    passingScore: number,
  ): ScoreResult {
    const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]))
    let totalPoints = 0
    let earnedPoints = 0
    let correctCount = 0
    let incorrectCount = 0
    let skippedCount = 0

    for (const question of questions) {
      totalPoints += question.points
      const answer = answerMap.get(question._id)

      if (!answer) {
        skippedCount += 1
        continue
      }

      const points = answer.pointsEarned || 0
      earnedPoints += points

      if (points >= question.points) correctCount += 1
      else incorrectCount += 1
    }

    const scorePercentage =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

    return {
      totalPoints,
      earnedPoints,
      scorePercentage,
      correctCount,
      incorrectCount,
      skippedCount,
      passed: scorePercentage >= passingScore,
    }
  }

  isMCQCorrect(userAnswer: string, correctAnswer: string): boolean {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
  }

  identifyWeakAndStrongTopics(
    questions: MockTestQuestionEntity[],
    answers: MockTestAnswerEntity[],
  ): { strongTopics: string[]; weakTopics: string[] } {
    const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]))
    const difficultyPerformance: Record<string, { correct: number; total: number }> = {}

    for (const question of questions) {
      const key = question.difficulty
      difficultyPerformance[key] ||= { correct: 0, total: 0 }
      difficultyPerformance[key].total += 1

      const answer = answerMap.get(question._id)

      if (answer && (answer.pointsEarned || 0) >= question.points) {
        difficultyPerformance[key].correct += 1
      }
    }

    const strongTopics: string[] = []
    const weakTopics: string[] = []

    for (const [difficulty, performance] of Object.entries(difficultyPerformance)) {
      const rate = performance.total > 0 ? performance.correct / performance.total : 0

      if (rate >= 0.7) strongTopics.push(difficulty)
      else weakTopics.push(difficulty)
    }

    return { strongTopics, weakTopics }
  }

  generateRecommendations(
    scorePercentage: number,
    weakTopics: string[],
    passed: boolean,
  ): string[] {
    const recommendations: string[] = []

    if (!passed) {
      recommendations.push('Review missed questions and retake the test after focused practice.')
    }

    if (weakTopics.includes('hard')) {
      recommendations.push('Focus on advanced concepts and solve more hard-level timed questions.')
    }

    if (weakTopics.includes('medium')) {
      recommendations.push('Strengthen intermediate concepts before moving to harder tests.')
    }

    if (scorePercentage < 50) {
      recommendations.push('Revisit foundational subtopics before retaking this test.')
    } else if (scorePercentage < 70) {
      recommendations.push('Good progress. Practice more timed questions to improve speed.')
    } else if (scorePercentage >= 90) {
      recommendations.push('Excellent performance. Challenge yourself with a harder mock test.')
    }

    return recommendations
  }
}
