import { ACTIVITY_DAILY_GOAL_REWARD_XP } from '../../domain/activity.constants';
import { ActivityDomainError } from '../../domain/activity-domain.error';
import type { IActivityCommandRepository } from '../../domain/repositories/activity-command.repository.interface';
import type { IActivityQueryRepository } from '../../domain/repositories/activity-query.repository.interface';
import type { RecordUserActivityPayloadDTO, RecordUserActivityResponseDTO } from '../activity.dto';
import { ActivityApplicationError } from '../activity-application.error';
import type { ActivityMapperContract } from '../activity.mapper';
import { ActivityEventPolicy } from '../activity-event.policy';
import type { ActivityDateRangeContract } from '../services/activity-date-range.service';
import type { IClock } from '../../../../../shared/time/clock.interface';

const DAY_IN_MS = 86_400_000;

type RecordActivityRepository = IActivityCommandRepository & IActivityQueryRepository;

export interface IRecordUserActivityUseCase {
  execute(payload: RecordUserActivityPayloadDTO): Promise<RecordUserActivityResponseDTO>;
}

export class RecordUserActivityUseCase implements IRecordUserActivityUseCase {
  constructor(
    private readonly _activityRepository: RecordActivityRepository,
    private readonly _eventPolicy: ActivityEventPolicy,
    private readonly _mapper: ActivityMapperContract,
    private readonly _dateRange: ActivityDateRangeContract,
    private readonly _clock: IClock
  ) {}

  async execute(payload: RecordUserActivityPayloadDTO): Promise<RecordUserActivityResponseDTO> {
    this._eventPolicy.ensureValid(payload);

    const occurredAt = payload.occurredAt ?? this._clock.now();
    const utcOffsetMinutes = payload.utcOffsetMinutes ?? 0;
    const context = this._dateRange.createContext(occurredAt, undefined, utcOffsetMinutes);

    try {
      const primaryResult = await this._activityRepository.recordActivityAndApplyReward({
        userId: payload.userId,

        category: payload.category,
        type: payload.type,

        title: payload.title.trim(),
        subtitle: payload.subtitle?.trim() ?? '',

        xpAwarded: payload.xpAwarded ?? 0,
        xpBucket: payload.xpBucket ?? 'none',
        coinsAwarded: payload.coinsAwarded ?? 0,

        eventKey: payload.eventKey.trim(),
        activityDateKey: context.todayKey,
        activityDayRange: context.todayRange,
        previousDayRange: {
          start: new Date(context.todayRange.start.getTime() - DAY_IN_MS),
          end: context.todayRange.start,
        },

        ...(payload.trackerId !== undefined ? { trackerId: payload.trackerId } : {}),
        ...(payload.topicId !== undefined ? { topicId: payload.topicId } : {}),
        ...(payload.subtopicId !== undefined ? { subtopicId: payload.subtopicId } : {}),
        ...(payload.mockTestId !== undefined ? { mockTestId: payload.mockTestId } : {}),
        ...(payload.attemptId !== undefined ? { attemptId: payload.attemptId } : {}),
        ...(payload.sourceUserId !== undefined ? { sourceUserId: payload.sourceUserId } : {}),

        details: payload.details ?? {},
        occurredAt,
      });

      const dailyGoalActivity = await this.tryAwardDailyGoal({
        userId: payload.userId,
        primaryType: payload.type,
        occurredAt,
        activityDateKey: context.todayKey,
        todayRange: context.todayRange,
        previousDayRange: {
          start: new Date(context.todayRange.start.getTime() - DAY_IN_MS),
          end: context.todayRange.start,
        },
      });

      return {
        activity: this._mapper.toEventView(
          primaryResult.activity,
          this._dateRange,
          utcOffsetMinutes
        ),
        created: primaryResult.created,
        dailyGoalAwarded: dailyGoalActivity?.created ?? false,
      };
    } catch (error) {
      if (error instanceof ActivityDomainError) {
        if (error.code === 'ACTIVITY_USER_NOT_FOUND') {
          throw ActivityApplicationError.userNotFound(error.message);
        }

        if (error.code === 'ACTIVITY_EVENT_CONFLICT') {
          throw ActivityApplicationError.eventConflict(error.message);
        }
      }

      throw error;
    }
  }

  private async tryAwardDailyGoal(input: {
    userId: string;
    primaryType: RecordUserActivityPayloadDTO['type'];
    occurredAt: Date;
    activityDateKey: string;
    todayRange: {
      start: Date;
      end: Date;
    };
    previousDayRange: {
      start: Date;
      end: Date;
    };
  }) {
    if (input.primaryType !== 'subtopic_completed' && input.primaryType !== 'mock_test_completed') {
      return null;
    }

    const state = await this._activityRepository.findDailyGoalState({
      userId: input.userId,
      todayRange: input.todayRange,
    });

    if (!state.subtopicCompleted || !state.mockTestCompleted) {
      return null;
    }

    return this._activityRepository.recordActivityAndApplyReward({
      userId: input.userId,

      category: 'streak',
      type: 'daily_goal_completed',

      title: 'Daily goal completed',
      subtitle: 'Completed one subtopic and one mock test today',

      xpAwarded: ACTIVITY_DAILY_GOAL_REWARD_XP,
      xpBucket: 'learning',
      coinsAwarded: 0,

      eventKey: `daily-goal-completed:${input.activityDateKey}`,
      activityDateKey: input.activityDateKey,
      activityDayRange: input.todayRange,
      previousDayRange: input.previousDayRange,

      details: {
        milestoneValue: 2,
      },

      occurredAt: input.occurredAt,
    });
  }
}
