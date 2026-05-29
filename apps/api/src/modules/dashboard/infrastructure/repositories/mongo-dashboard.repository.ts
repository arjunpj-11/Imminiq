// apps/api/src/modules/dashboard/infrastructure/repositories/mongo-dashboard.repository.ts

import mongoose from 'mongoose'
import type { DashboardRepository } from '../../domain/repositories/dashboard.repository.interface'
import { User } from '../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'
import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerProgress } from '../../../../infrastructure/database/models/tracker-progress.model'
import { StreakHistory } from '../../../../infrastructure/database/models/streak-history.model'
import { StreakSnapshot } from '../../../../infrastructure/database/models/streak-snapshot.model'
import { Notification } from '../../../../infrastructure/database/models/notification.model'

export const mongoDashboardRepository = {
  // ─── USER ────────────────────────────────────────

 getUserWithProfile: async (userId: string) => {
    const [user, profile] = await Promise.all([
      User.findById(userId)
        .select('_id fullName username avatarUrl isPremium coins')
        .lean(),

      UserProfile.findOne({ userId })
        .select('avatarUrl')
        .lean(),
    ])

    return { user, profile }
  },

  // ─── STREAK ──────────────────────────────────────

getStreakData: async (userId: string) => {
  const streak = await StreakSnapshot.findOne({
    userId,
    deletedAt: null,
  })
    .sort({ snapshotDate: -1 })
    .select('currentStreak longestStreak snapshotDate')
    .lean()

  if (!streak) {
    return {
      current: 0,
      longest: 0,
      lastActiveAt: null,
    }
  }

  return {
    current: streak.currentStreak || 0,
    longest: streak.longestStreak || 0,
    lastActiveAt: streak.snapshotDate || null,
  }
},

  // ─── TRACKER OVERVIEW ────────────────────────────

getTrackerOverview: async (userId: string) => {
  const [allTrackers, allProgress] = await Promise.all([
    Tracker.find({
      ownerId: userId,
      status: { $ne: 'archived' },
    })
      .select('_id title level updatedAt topicsCount subtopicsCount')
      .sort({ updatedAt: -1 })
      .lean(),

    TrackerProgress.find({ userId })
      .select('trackerId completionPercentage lastStudiedAt completedTopics')
      .lean(),
  ])

  const progressMap = new Map(
    allProgress.map((progress) => [
      progress.trackerId.toString(),
      progress,
    ])
  )

  const trackersWithProgress = allTrackers.map((tracker) => {
    const progress = progressMap.get(tracker._id.toString())

    const totalTopics = tracker.topicsCount ?? 0
    const completedTopics = progress?.completedTopics ?? 0
    const remainingTopics = Math.max(0, totalTopics - completedTopics)

    return {
      _id: tracker._id.toString(),
      title: tracker.title,
      level: tracker.level,
      completionPercentage: progress?.completionPercentage || 0,
      lastStudiedAt: progress?.lastStudiedAt || null,
      updatedAt: tracker.updatedAt,
      totalTopics,
      completedTopics,
      remainingTopics,
    }
  })

  const activeTrackerList = trackersWithProgress.filter(
    (t) => t.completionPercentage < 100
  )

  const completedTrackerList = trackersWithProgress.filter(
    (t) => t.completionPercentage >= 100
  )

  const activeTrackers = [...activeTrackerList]
    .sort((a, b) => {
      const aDate = a.lastStudiedAt
        ? new Date(a.lastStudiedAt).getTime()
        : new Date(a.updatedAt).getTime()
      const bDate = b.lastStudiedAt
        ? new Date(b.lastStudiedAt).getTime()
        : new Date(b.updatedAt).getTime()
      return bDate - aDate
    })
    .slice(0, 5)
    .map(({ updatedAt: _updatedAt, ...tracker }) => tracker)

  return {
    total: trackersWithProgress.length,
    active: activeTrackerList.length,
    completed: completedTrackerList.length,
    activeTrackers,
  }
},
  // ─── DASHBOARD STATS ─────────────────────────────

  getAggregatedStats: async (userId: string) => {
    const [progressAggregation, publishedTrackers, user] =
      await Promise.all([
        TrackerProgress.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
            },
          },
          {
            $group: {
              _id: null,

              totalSubtopicsCompleted: {
  $sum: {
    $ifNull: ['$completedSubtopics', 0],
  },
},

              
            },
          },
        ]),

        Tracker.countDocuments({
          ownerId: userId,
          visibility: 'public',
        }),

        User.findById(userId)
          .select('coins')
          .lean(),
      ])

    return {
      totalSubtopicsCompleted:
        progressAggregation[0]?.totalSubtopicsCompleted || 0,

     

      totalPoints:
        user?.coins || 0,

      publishedTrackers,
    }
  },

  // ─── RECENT ACTIVITY ─────────────────────────────

  getRecentActivity: async (
    userId: string,
    limit = 5
  ) => {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('type message createdAt')
      .lean()

    return notifications.map((notification) => ({
      type: notification.type,
      description: notification.message,
      createdAt: notification.createdAt,
    }))
  },

  // ─── UNREAD NOTIFICATION COUNT ──────────────────

  getUnreadNotificationCount: async (userId: string) => {
    return Notification.countDocuments({
      userId,
      isRead: false,
    })
  },

  // ─── ACTIVITY HEATMAP ────────────────────────────

 getActivityIntensity: async (
  userId: string,
  months = 6
) => {
  const fromDate = new Date()
  fromDate.setMonth(fromDate.getMonth() - months)

  const streakEntries = await StreakHistory.find({
    userId,
    date: { $gte: fromDate },
    deletedAt: null,
  })
    .sort({ date: 1 })
    .select('date activityCount intensityLevel isFrozen')
    .lean()

  return streakEntries.map((entry) => {
    const date = new Date(entry.date)
      .toISOString()
      .split('T')[0]

    const activityCount = entry.activityCount || 0

    const intensityCount =
      entry.intensityLevel === 'high'
        ? 4
        : entry.intensityLevel === 'medium'
          ? 3
          : entry.intensityLevel === 'low'
            ? 2
            : entry.isFrozen
              ? 1
              : 0

    return {
  date,
  activityCount,
  count: intensityCount,
}
  })
},

  // ─── RECENT BATTLES ──────────────────────────────

 // ─── RECENT BATTLES ──────────────────────────────

getRecentBattles: async (
  userId: string,
  limit = 5
) => {
  const { Battle } = await import(
    '../../../../infrastructure/database/models/battle.model'
  )

  const battles = await Battle.find({
    $or: [
      { playerOneId: userId },
      { playerTwoId: userId },
    ],
    status: 'completed',
  })
    .sort({ endedAt: -1, updatedAt: -1 })
    .limit(limit)
    .select(
      '_id challengeId playerOneId playerTwoId winnerId startedAt endedAt updatedAt'
    )
    .lean()

  if (battles.length === 0) {
    return []
  }

  const opponentIds = battles.map((battle) => {
    const playerOneId =
      battle.playerOneId.toString()

    const playerTwoId =
      battle.playerTwoId.toString()

    return playerOneId === userId
      ? playerTwoId
      : playerOneId
  })

  const [opponents, opponentProfiles] =
    await Promise.all([
      User.find({
        _id: { $in: opponentIds },
      })
        .select('_id fullName username')
        .lean(),

      UserProfile.find({
        userId: { $in: opponentIds },
      })
        .select('userId avatarUrl')
        .lean(),
    ])

  const opponentMap = new Map(
    opponents.map((opponent) => [
      opponent._id.toString(),
      opponent,
    ])
  )

  const profileMap = new Map(
    opponentProfiles.map((profile) => [
      profile.userId.toString(),
      profile.avatarUrl || '',
    ])
  )

  return battles.map((battle) => {
    const playerOneId =
      battle.playerOneId.toString()

    const playerTwoId =
      battle.playerTwoId.toString()

    const isCurrentUserPlayerOne =
      playerOneId === userId

    const actualOpponentId =
      isCurrentUserPlayerOne
        ? playerTwoId
        : playerOneId

    const opponent =
      opponentMap.get(actualOpponentId)

    let result: 'win' | 'loss' | 'draw' = 'draw'

    if (battle.winnerId) {
      result =
        battle.winnerId.toString() === userId
          ? 'win'
          : 'loss'
    }

    return {
      _id: battle._id.toString(),

      opponent: opponent
        ? {
            _id: opponent._id.toString(),
            fullName: opponent.fullName,
            username: opponent.username,
            avatarUrl:
              profileMap.get(actualOpponentId) || '',
          }
        : null,

      result,

      startedAt: battle.startedAt || null,
      completedAt:
        battle.endedAt || battle.updatedAt,
    }
  })
},

  // ─── FRIENDS HUB ─────────────────────────────────

  getFriendsHub: async (
    userId: string,
    limit = 10
  ) => {
    const { Friend } = await import(
      '../../../../infrastructure/database/models/friend.model'
    )

    const friendships = await Friend.find({
      $or: [
        { userId },
        { friendId: userId },
      ],
    })
      .limit(limit)
      .lean()

    if (friendships.length === 0) {
      return []
    }

    const friendIds = friendships.map((friendship) =>
      friendship.userId.toString() === userId
        ? friendship.friendId.toString()
        : friendship.userId.toString()
    )

    const [friends, friendProfiles] =
      await Promise.all([
        User.find({
          _id: { $in: friendIds },
        })
          .select(
            '_id fullName username lastActiveAt'
          )
          .lean(),

        UserProfile.find({
          userId: { $in: friendIds },
        })
          .select('userId avatarUrl')
          .lean(),
      ])

    const profileMap = new Map(
      friendProfiles.map((profile) => [
        profile.userId.toString(),
        profile.avatarUrl || '',
      ])
    )

    return friends.map((friend) => ({
      _id: friend._id.toString(),
      fullName: friend.fullName,
      username: friend.username,
      avatarUrl:
        profileMap.get(friend._id.toString()) || '',
      lastActiveAt:
        friend.lastActiveAt || null,

      isOnline: friend.lastActiveAt
        ? Date.now() -
            new Date(friend.lastActiveAt).getTime() <
          5 * 60 * 1000
        : false,
    }))
  },

  // ─── RECOMMENDED ACTIONS ─────────────────────────

 getRecommendedActions: async (userId: string) => {
  const [latestProgress, totalTrackersCount] = await Promise.all([
    TrackerProgress.findOne({
      userId,
    })
      .sort({ lastStudiedAt: -1 })
      .select('trackerId completionPercentage lastStudiedAt')
      .lean(),

    Tracker.countDocuments({
      ownerId: userId,
      deletedAt: null,
    }),
  ])

  const actions: {
    type: string
    title: string
    description: string
    link: string
  }[] = []

  if (
    latestProgress &&
    latestProgress.completionPercentage < 100
  ) {
    const tracker = await Tracker.findOne({
      _id: latestProgress.trackerId,
      ownerId: userId,
      deletedAt: null,
    })
      .select('_id title')
      .lean()

    if (tracker) {
      actions.push({
        type: 'continue_tracker',
        title: `Continue "${tracker.title}"`,
        description: `You are ${Math.round(
          latestProgress.completionPercentage || 0
        )}% through`,
        link: `/trackers/${tracker._id.toString()}`,
      })
    }
  }

  if (totalTrackersCount === 0) {
    actions.push({
      type: 'create_tracker',
      title: 'Create your first tracker',
      description:
        'Use AI to build a personalized learning roadmap',
      link: '/onboarding/step-1',
    })
  }

  actions.push({
    type: 'explore_community',
    title: 'Explore Community',
    description:
      'Discover trackers shared by other learners',
    link: '/community',
  })

  actions.push({
    type: 'start_mock_test',
    title: 'Take a Mock Test',
    description:
      'Evaluate your knowledge with AI-generated questions',
    link: '/mock-tests',
  })

  return actions.slice(0, 4)
},
} satisfies DashboardRepository
