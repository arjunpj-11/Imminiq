import type { UserActivityEntity } from '../../domain/entities/user-activity.entity'
import type { ActivityAnalyticsRecord } from '../../domain/types/activity.types'
import type {
  ActivityEventIcon,
  ActivityEventView,
  ActivityFeedGroupView,
  ActivityPageResponse,
  ActivityWeekDayView,
} from '../dtos/activity.dto'
import { ACTIVITY_FEED_ICON_BY_CATEGORY } from '../constants/activity.constants'
import type { ActivityDateContext } from '../services/activity-date-range.service'
import type { ActivityDateRangeContract } from '../services/activity-date-range.service'
import type { ActivityAnalyticsContract } from '../services/activity-analytics.service'

export class ActivityMapper {
  toEventView(
    activity: UserActivityEntity,
    dateRange: ActivityDateRangeContract,
    utcOffsetMinutes: number,
  ): ActivityEventView {
    return {
      id: activity.id,
      category: activity.category,
      type: activity.type,
      icon:
        ACTIVITY_FEED_ICON_BY_CATEGORY[
          activity.category
        ] as ActivityEventIcon,

      title: activity.title,
      subtitle: activity.subtitle,

      xp: activity.xpAwarded,
      xpBucket: activity.xpBucket,
      coins: activity.coinsAwarded,

      occurredAt: activity.occurredAt.toISOString(),
      date: dateRange.toLocalDateKey(
        activity.occurredAt,
        utcOffsetMinutes,
      ),

      details: activity.details,

      references: {
        trackerId: activity.trackerId,
        topicId: activity.topicId,
        subtopicId: activity.subtopicId,
        mockTestId: activity.mockTestId,
        attemptId: activity.attemptId,
        sourceUserId: activity.sourceUserId,
      },
    }
  }

  toGroupedFeed(
    activities: UserActivityEntity[],
    context: ActivityDateContext,
    dateRange: ActivityDateRangeContract,
  ): ActivityFeedGroupView[] {
    const groups = new Map<string, ActivityEventView[]>()

    for (const activity of activities) {
      const event = this.toEventView(
        activity,
        dateRange,
        context.utcOffsetMinutes,
      )

      const group = groups.get(event.date) ?? []
      group.push(event)
      groups.set(event.date, group)
    }

    return [...groups.entries()].map(([date, events]) => ({
      date,
      label: dateRange.groupLabel(date, context),
      events,
    }))
  }

  toPageResponse(input: {
    analytics: ActivityAnalyticsRecord
    context: ActivityDateContext
    feed: ActivityPageResponse['feed']
    analyticsCalculator: ActivityAnalyticsContract
    dateRange: ActivityDateRangeContract
  }): ActivityPageResponse {
    const {
      analyticsCalculator,
      context,
      feed,
      analytics,
      dateRange,
    } = input

    if (!analytics.user) {
      throw new Error('Activity user mapping requires a user')
    }

    const currentWeekByDate = new Map(
      analytics.currentWeekDays.map((day) => [
        day.date,
        day,
      ]),
    )

    const weekDays: ActivityWeekDayView[] =
      context.currentWeekDateKeys.map((date) => {
        const aggregate = currentWeekByDate.get(date)

        return {
          date,
          label: dateRange.weekdayLabel(date),
          xp: aggregate?.xp ?? 0,
          sessions: aggregate?.sessions ?? 0,
        }
      })

    const currentXp = analyticsCalculator.sumXp(
      analytics.currentWeekDays,
    )

    const progress =
      analyticsCalculator.weeklyProgress(currentXp)

    const dailyGoal =
      analyticsCalculator.dailyGoal(analytics.dailyGoal)

    return {
      generatedAt: context.now.toISOString(),

      user: {
        userId: analytics.user.userId,
        fullName: analytics.user.fullName,
        avatarUrl: analytics.user.avatarUrl,
        isPremium: analytics.user.isPremium,
        accountCreatedAt:
          analytics.user.accountCreatedAt.toISOString(),
      },

      stats: {
        totalXp:
          analytics.user.learningXp +
          analytics.user.teacherXp,
        learningXp: analytics.user.learningXp,
        teacherXp: analytics.user.teacherXp,
        coins: analytics.user.coins,

        sessions: analytics.statistics.sessions,
        subtopicsDone:
          analytics.statistics.subtopicsDone,
        testsAttempted:
          analytics.statistics.testsAttempted,
        totalQuestions:
          analytics.statistics.totalQuestions,
      },

      streak: {
        currentStreak:
          analytics.streak.currentStreak,
        longestStreak:
          analytics.streak.longestStreak,
        totalActiveDays:
          analytics.streak.totalActiveDays,
        totalFreezeUsed:
          analytics.streak.totalFreezeUsed,

        heatmap: analytics.streak.days.map((day) => ({
          date: day.date,
          intensityLevel: day.intensityLevel,
          activityCount: day.activityCount,
          isFrozen: day.isFrozen,
        })),
      },

      weekly: {
        days: weekDays,
        currentXp,
        previousXp: analytics.previousWeekXp,

        growthPercent:
          analyticsCalculator.growthPercent(
            currentXp,
            analytics.previousWeekXp,
          ),

        ...progress,

        breakdown: {
          trackerXp:
            analytics.currentWeekBreakdown.tracker,
          testXp:
            analytics.currentWeekBreakdown.mockTest,
          communityXp:
            analytics.currentWeekBreakdown.community,
          streakXp:
            analytics.currentWeekBreakdown.streak,
          milestoneXp:
            analytics.currentWeekBreakdown.xpMilestone,
        },
      },

      personalBests: {
        bestDayXp:
          analytics.personalBests.bestDayXp,
        longestStreak:
          analytics.streak.longestStreak,
        bestWeekSessions:
          analytics.personalBests.bestWeekSessions,
        bestTestScore:
          analytics.personalBests.bestTestScore,
      },

      dailyGoal: {
        tasks: [
          {
            key: 'subtopic',
            label: 'Complete one subtopic',
            completed:
              analytics.dailyGoal.subtopicCompleted,
          },
          {
            key: 'mock_test',
            label: 'Complete one mock test',
            completed:
              analytics.dailyGoal.mockTestCompleted,
          },
        ],

        ...dailyGoal,
      },

      feed,
    }
  }
}

export type ActivityMapperContract = Pick<
  ActivityMapper,
  'toEventView' | 'toGroupedFeed' | 'toPageResponse'
>
