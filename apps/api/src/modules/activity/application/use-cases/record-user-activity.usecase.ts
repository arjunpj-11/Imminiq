import {
  ACTIVITY_DAILY_GOAL_REWARD_XP,
} from '../../domain/constants/activity.constants'
import { ActivityDomainError } from '../../domain/errors/activity-domain.error'
import type { ActivityCommandRepositoryContract } from '../../domain/repositories/activity-command.repository.interface'
import type { ActivityQueryRepositoryContract } from '../../domain/repositories/activity-query.repository.interface'
import type { ActivityLeaderboardRecorderContract } from '../../domain/services/activity-leaderboard-recorder.service.interface'
import type {
  RecordUserActivityPayload,
  RecordUserActivityResponse,
} from '../dtos/activity.dto'
import { ActivityApplicationError } from '../errors/activity-application.error'
import { ActivityMapper } from '../mappers/activity.mapper'
import { ActivityEventPolicy } from '../policies/activity-event.policy'
import { ActivityDateRangeService } from '../services/activity-date-range.service'

type RecordActivityRepository =
  ActivityCommandRepositoryContract &
    ActivityQueryRepositoryContract

export class RecordUserActivityUseCase {
  constructor(
    private readonly _activityRepository: RecordActivityRepository,
    private readonly _leaderboardRecorder: ActivityLeaderboardRecorderContract,
    private readonly _eventPolicy: ActivityEventPolicy,
    private readonly _mapper: ActivityMapper,
    private readonly _dateRangeService: ActivityDateRangeService,
  ) {}

  async execute(
    payload: RecordUserActivityPayload,
  ): Promise<RecordUserActivityResponse> {
    this._eventPolicy.ensureValid(payload)

    const occurredAt = payload.occurredAt ?? new Date()
    const utcOffsetMinutes =
      payload.utcOffsetMinutes ?? 0

    try {
      const primaryResult =
        await this._activityRepository.recordActivityAndApplyReward({
          userId: payload.userId,

          category: payload.category,
          type: payload.type,

          title: payload.title.trim(),
          subtitle: payload.subtitle?.trim() ?? '',

          xpAwarded: payload.xpAwarded ?? 0,
          xpBucket: payload.xpBucket ?? 'none',
          coinsAwarded: payload.coinsAwarded ?? 0,

          eventKey: payload.eventKey.trim(),

          ...(payload.trackerId !== undefined
            ? { trackerId: payload.trackerId }
            : {}),
          ...(payload.topicId !== undefined
            ? { topicId: payload.topicId }
            : {}),
          ...(payload.subtopicId !== undefined
            ? { subtopicId: payload.subtopicId }
            : {}),
          ...(payload.mockTestId !== undefined
            ? { mockTestId: payload.mockTestId }
            : {}),
          ...(payload.attemptId !== undefined
            ? { attemptId: payload.attemptId }
            : {}),
          ...(payload.sourceUserId !== undefined
            ? { sourceUserId: payload.sourceUserId }
            : {}),

          details: payload.details ?? {},
          occurredAt,
        })

      await this.syncLeaderboard(primaryResult.activity)

      const dailyGoalActivity =
        await this.tryAwardDailyGoal({
          userId: payload.userId,
          primaryType: payload.type,
          occurredAt,
          utcOffsetMinutes,
        })

      return {
        activity: this._mapper.toEventView(
          primaryResult.activity,
          this._dateRangeService,
          utcOffsetMinutes,
        ),
        created: primaryResult.created,
        dailyGoalAwarded:
          dailyGoalActivity?.created ?? false,
      }
    } catch (error) {
      if (error instanceof ActivityDomainError) {
        if (error.code === 'ACTIVITY_USER_NOT_FOUND') {
          throw ActivityApplicationError.userNotFound(
            error.message,
          )
        }

        if (error.code === 'ACTIVITY_EVENT_CONFLICT') {
          throw ActivityApplicationError.eventConflict(
            error.message,
          )
        }
      }

      throw error
    }
  }

  private async tryAwardDailyGoal(input: {
    userId: string
    primaryType: RecordUserActivityPayload['type']
    occurredAt: Date
    utcOffsetMinutes: number
  }) {
    if (
      input.primaryType !== 'subtopic_completed' &&
      input.primaryType !== 'mock_test_completed'
    ) {
      return null
    }

    const context =
      this._dateRangeService.createContext(
        input.occurredAt,
        undefined,
        input.utcOffsetMinutes,
      )

    const state =
      await this._activityRepository.findDailyGoalState({
        userId: input.userId,
        todayRange: context.todayRange,
      })

    if (
      !state.subtopicCompleted ||
      !state.mockTestCompleted
    ) {
      return null
    }

    const result =
      await this._activityRepository.recordActivityAndApplyReward({
        userId: input.userId,

        category: 'streak',
        type: 'daily_goal_completed',

        title: 'Daily goal completed',
        subtitle:
          'Completed one subtopic and one mock test today',

        xpAwarded: ACTIVITY_DAILY_GOAL_REWARD_XP,
        xpBucket: 'learning',
        coinsAwarded: 0,

        eventKey: `daily-goal-completed:${context.todayKey}`,

        details: {
          milestoneValue: 2,
        },

        occurredAt: input.occurredAt,
      })

    await this.syncLeaderboard(result.activity)

    return result
  }

  private async syncLeaderboard(
    activity: Awaited<
      ReturnType<
        ActivityCommandRepositoryContract['recordActivityAndApplyReward']
      >
    >['activity'],
  ): Promise<void> {
    if (
      activity.xpAwarded <= 0 ||
      activity.xpBucket === 'none'
    ) {
      return
    }

    await this._leaderboardRecorder.recordXp({
      userId: activity.userId,
      activityId: activity.id,
      eventKey: activity.eventKey,
      type: activity.type,
      bucket: activity.xpBucket,
      amount: activity.xpAwarded,
      occurredAt: activity.occurredAt,
    })
  }
}
