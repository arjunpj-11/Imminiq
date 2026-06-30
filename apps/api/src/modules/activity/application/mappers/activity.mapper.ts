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
import type { ActivityDateRangeService } from '../services/activity-date-range.service'
import type { ActivityAnalyticsService } from '../services/activity-analytics.service'

export class ActivityMapper {
  toEventView(
    activity: UserActivityEntity,
    dateRangeService: ActivityDateRangeService,
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
      date: dateRangeService.toLocalDateKey(
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
    dateRangeService: ActivityDateRangeService,
  ): ActivityFeedGroupView[] {
    const groups = new Map<string, ActivityEventView[]>()

    for (const activity of activities) {
      const event = this.toEventView(
        activity,
        dateRangeService,
        context.utcOffsetMinutes,
      )

      const group = groups.get(event.date) ?? []
      group.push(event)
      groups.set(event.date, group)
    }

    return [...groups.entries()].map(([date, events]) => ({
      date,
      label: dateRangeService.groupLabel(date, context),
      events,
    }))
  }

  toPageResponse(input: {
    analytics: ActivityAnalyticsRecord
    context: ActivityDateContext
    feed: ActivityPageResponse['feed']
    analyticsService: ActivityAnalyticsService
    dateRangeService: ActivityDateRangeService
  }): ActivityPageResponse {
    const {
      analytics,
      context,
      feed,
      analyticsService,
      dateRangeService,
    } = input

    if (!analytics.user) {
      throw new Error('Activity user mapping requires a user')
    }

    const streak = analyticsService.calculateStreak(
      analytics.activeDateKeys,
      context.todayKey,
      context.yesterdayKey,
    )

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
          label: dateRangeService.weekdayLabel(date),
          xp: aggregate?.xp ?? 0,
          sessions: aggregate?.sessions ?? 0,
        }
      })

    const currentXp = analyticsService.sumXp(
      analytics.currentWeekDays,
    )

    const progress =
      analyticsService.weeklyProgress(currentXp)

    const dailyGoal =
      analyticsService.dailyGoal(analytics.dailyGoal)

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
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,

        heatmap: analytics.yearDays.map((day) => ({
          date: day.date,
          intensityLevel:
            analyticsService.heatmapIntensity(
              day.activityCount,
            ),
          activityCount: day.activityCount,
          isFrozen: false,
        })),
      },

      weekly: {
        days: weekDays,
        currentXp,
        previousXp: analytics.previousWeekXp,

        growthPercent:
          analyticsService.growthPercent(
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
        longestStreak: streak.longestStreak,
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
