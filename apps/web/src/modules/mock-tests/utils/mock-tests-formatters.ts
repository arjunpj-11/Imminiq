import type { DifficultyLevel, MockTestListItem } from '../types/mock-tests.types'

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')
export const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'
export const formatDuration = (seconds?: number) => {
  if (!seconds) return '—'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`
}
export const difficultyBadge = (difficulty: DifficultyLevel) => difficulty === 'hard' ? 'Expert' : difficulty === 'medium' ? 'Intermediate' : 'Beginner'
export const getTestScore = (test: MockTestListItem) => test.latestAttempt?.scorePercentage ?? test.averageScore ?? 0
export const isHighScore = (score: number) => score >= 85
export const getProgressLabel = (test: MockTestListItem) => test.latestAttempt?.status === 'in_progress' ? 'Continue' : test.latestAttempt?.status === 'completed' ? 'Retake' : 'Start'
