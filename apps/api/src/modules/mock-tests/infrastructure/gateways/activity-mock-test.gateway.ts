import { activityService } from '../../../activity'
import type { ActivityRecorderContract } from '../../../activity/activity.service'
import type {
  MockTestActivityServiceContract,
  RecordMockTestCompletedActivityInput,
  RecordMockTestGeneratedActivityInput,
} from '../../domain/services/mock-test-activity.service.interface'

type ActivityDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced'

const normalizeText = (
  value: string | null | undefined,
  fallback: string,
  maximumLength: number,
): string => {
  const normalized = value?.trim() || fallback

  if (normalized.length <= maximumLength) {
    return normalized
  }

  return normalized.slice(0, maximumLength).trimEnd()
}

const normalizeNonNegativeInteger = (
  value: number,
): number => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.floor(value))
}

const normalizePercentage = (
  value: number,
): number => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, value))
}

const toActivityDifficulty = (
  difficulty: string,
): ActivityDifficulty => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
    case 'beginner':
      return 'beginner'

    case 'hard':
    case 'advanced':
      return 'advanced'

    case 'medium':
    case 'intermediate':
    default:
      return 'intermediate'
  }
}

const toDifficultyLabel = (
  difficulty: string,
): string => {
  const normalized = difficulty.trim()

  if (!normalized) {
    return 'Medium'
  }

  return (
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1).toLowerCase()
  )
}

export class ActivityMockTestGateway
  implements MockTestActivityServiceContract
{
  constructor(
    private readonly _activityRecorder: ActivityRecorderContract,
  ) {}
  async recordMockTestGenerated(
    input: RecordMockTestGeneratedActivityInput,
  ): Promise<void> {
    const testTitle = normalizeText(
      input.testTitle,
      'Untitled mock test',
      160,
    )

    const totalQuestions =
      normalizeNonNegativeInteger(
        input.totalQuestions,
      )

    const difficulty =
      toActivityDifficulty(
        String(input.difficulty),
      )

    const subtitle = normalizeText(
      `${totalQuestions} questions · ${toDifficultyLabel(
        String(input.difficulty),
      )}`,
      `${totalQuestions} questions`,
      300,
    )

    await this._activityRecorder.recordActivity({
      userId: input.userId,

      category: 'mock_test',
      type: 'mock_test_generated',

      title: normalizeText(
        `Generated ${testTitle}`,
        'Generated mock test',
        180,
      ),

      subtitle,

      xpAwarded: 0,
      xpBucket: 'none',
      coinsAwarded: 0,

      eventKey:
        `mock-test-generated:${input.mockTestId}`,

      mockTestId: input.mockTestId,

      ...(input.trackerId
        ? {
            trackerId: input.trackerId,
          }
        : {}),

      details: {
        totalQuestions,
        difficulty,
      },

      ...(input.utcOffsetMinutes !== undefined
        ? {
            utcOffsetMinutes:
              input.utcOffsetMinutes,
          }
        : {}),
    })
  }

  async recordMockTestCompleted(
    input: RecordMockTestCompletedActivityInput,
  ): Promise<void> {
    const testTitle = normalizeText(
      input.testTitle,
      'Untitled mock test',
      160,
    )

    const totalQuestions =
      normalizeNonNegativeInteger(
        input.totalQuestions,
      )

    const correctAnswers = Math.min(
      totalQuestions,
      normalizeNonNegativeInteger(
        input.correctAnswers,
      ),
    )

    const durationSeconds =
      normalizeNonNegativeInteger(
        input.durationSeconds,
      )

    const scorePercentage =
      normalizePercentage(
        input.scorePercentage,
      )

    const xpAwarded =
      normalizeNonNegativeInteger(
        input.xpAwarded,
      )

    const resultLabel = input.passed
      ? 'Passed'
      : 'Not passed'

    const subtitle = normalizeText(
      [
        `${correctAnswers}/${totalQuestions} correct`,
        `${Math.round(scorePercentage)}%`,
        resultLabel,
      ].join(' · '),
      resultLabel,
      300,
    )

    await this._activityRecorder.recordActivity({
      userId: input.userId,

      category: 'mock_test',
      type: 'mock_test_completed',

      title: normalizeText(
        `Completed ${testTitle}`,
        'Completed mock test',
        180,
      ),

      subtitle,

      xpAwarded,

      xpBucket:
        xpAwarded > 0
          ? 'learning'
          : 'none',

      coinsAwarded: 0,

      eventKey:
        `mock-test-completed:${input.attemptId}`,

      mockTestId: input.mockTestId,
      attemptId: input.attemptId,

      ...(input.trackerId
        ? {
            trackerId: input.trackerId,
          }
        : {}),

      details: {
        scorePercentage,
        totalQuestions,
        correctAnswers,
        durationSeconds,

        difficulty:
          toActivityDifficulty(
            String(input.difficulty),
          ),
      },

      ...(input.utcOffsetMinutes !== undefined
        ? {
            utcOffsetMinutes:
              input.utcOffsetMinutes,
          }
        : {}),
    })
  }
}

export const activityMockTestGateway =
  new ActivityMockTestGateway(activityService)
