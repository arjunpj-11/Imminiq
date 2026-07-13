import type { AdaptiveMasteryLevel } from '../adaptive-learning.types'

export const adaptiveMasteryLevelFor = (
  score: number,
): AdaptiveMasteryLevel => {
  if (score < 25) return 'foundation'
  if (score < 50) return 'developing'
  if (score < 75) return 'proficient'
  return 'advanced'
}

export const calculateAdaptiveMasteryResult = (input: {
  currentMasteryScore: number
  predictedScore: number
  actualScore: number
}) => {
  const scoreDifference = input.actualScore - input.predictedScore
  const magnitude =
    scoreDifference === 0
      ? 0
      : Math.max(1, Math.min(8, Math.round(Math.abs(scoreDifference) / 5)))
  const change = Math.sign(scoreDifference) * magnitude
  const masteryScore = Math.max(
    0,
    Math.min(100, input.currentMasteryScore + change),
  )

  return {
    change,
    masteryScore,
    level: adaptiveMasteryLevelFor(masteryScore),
  }
}
