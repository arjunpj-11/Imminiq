import type { CommunityLeaderboardEntryEntity } from '../../domain/entities/community-leaderboard-entry.entity'
import type { CommunityMemberStatsEntity } from '../../domain/entities/community-member-stats.entity'
import type { CommunityReviewVoteEntity } from '../../domain/entities/community-review-vote.entity'
import type { CommunityTrackerEntity } from '../../domain/entities/community-tracker.entity'
import type { CommunityVerificationSubmissionEntity } from '../../domain/entities/community-verification-submission.entity'
import type { CommunityTrackerPageResult } from '../../domain/repositories/community-tracker.repository.interface'
import type { VerificationQueueResult } from '../../domain/repositories/community-verification.repository.interface'
import type {
  CommunityLeaderboardEntryView,
  CommunityPaginationView,
  CommunityStatCardView,
  CommunityTrackerListView,
  CommunityTrackerView,
  CommunityVerificationQueueView,
  CommunityVerificationSubmissionView,
  CommunityVerificationStatsView,
  CommunityVerifyItemView,
} from '../dtos/community.dto'

export interface CommunityMapperContract {
  toTrackerView(entity: CommunityTrackerEntity): CommunityTrackerView
  toTrackerListView(page: CommunityTrackerPageResult): CommunityTrackerListView
  toStatCards(entity: CommunityMemberStatsEntity): CommunityStatCardView[]
  toVerifyItemView(
    entity: CommunityVerificationSubmissionEntity,
  ): CommunityVerifyItemView
  toVerificationSubmissionView(
    entity: CommunityVerificationSubmissionEntity,
  ): CommunityVerificationSubmissionView
  toVerificationQueueView(page: VerificationQueueResult): CommunityVerificationQueueView
  toLeaderboardEntryView(
    entity: CommunityLeaderboardEntryEntity,
  ): CommunityLeaderboardEntryView
  toVoteView(entity: CommunityReviewVoteEntity): {
    _id: string
    submissionId: string
    choice: CommunityReviewVoteEntity['choice']
    rewardCoins: number
  }
  toVerificationStatsView(input: {
    awaiting: number
    reviewed: number
    totalEarnedCoins: number
    coinBalance: number
    queueCount: number
    rewardCoins: number
    activeReviewersThisWeek: number
  }): CommunityVerificationStatsView
}

export class CommunityMapper implements CommunityMapperContract {
  toTrackerView(entity: CommunityTrackerEntity): CommunityTrackerView {
    return {
      _id: entity.id,
      title: entity.title,
      description: entity.description,
      rating: Number(entity.rating.toFixed(1)),
      clones: entity.clones,
      verified: entity.verified,
      inDashboard: entity.inDashboard,
      topic: entity.topic,
    }
  }

  toTrackerListView(page: CommunityTrackerPageResult): CommunityTrackerListView {
    return {
      trackers: page.items.map((item) => this.toTrackerView(item)),
      pagination: this.toPaginationView(page),
    }
  }

  toStatCards(entity: CommunityMemberStatsEntity): CommunityStatCardView[] {
    return [
      {
        label: 'Your published',
        value: this.formatCompactNumber(entity.publishedCount),
        helper: "Trackers you've shared",
      },
      {
        label: 'Clones received',
        value: this.formatCompactNumber(entity.clonesReceived),
        helper: 'Others copied your work',
      },
      {
        label: 'Cloned by you',
        value: this.formatCompactNumber(entity.clonedByUser),
        helper: 'In your dashboard',
      },
      {
        label: 'Avg rating',
        value: entity.averageRating.toFixed(1),
        helper: 'Across your publications',
      },
    ]
  }

  toVerifyItemView(
    entity: CommunityVerificationSubmissionEntity,
  ): CommunityVerifyItemView {
    const closed = entity.status !== 'open'

    return {
      _id: entity.id,
      title: entity.title,
      category: entity.category,
      timeLeft: closed ? '' : this.formatTimeLeft(entity.expiresAt),
      excerpt: entity.excerpt,
      progress: entity.progress,
      votedPass: entity.userVote === 'pass',
      closed,
      urgent: entity.urgent,
    }
  }

  toVerificationSubmissionView(
    entity: CommunityVerificationSubmissionEntity,
  ): CommunityVerificationSubmissionView {
    return {
      ...this.toVerifyItemView(entity),
      trackerId: entity.trackerId,
      ownerId: entity.ownerId,
      userVote: entity.userVote ?? null,
      consensusChoice: entity.consensusChoice ?? null,
    }
  }

  toVerificationQueueView(page: VerificationQueueResult): CommunityVerificationQueueView {
    return {
      items: page.items.map((item) => this.toVerifyItemView(item)),
      pagination: this.toPaginationView(page),
    }
  }

  toLeaderboardEntryView(
    entity: CommunityLeaderboardEntryEntity,
  ): CommunityLeaderboardEntryView {
    return {
      rank: entity.rank,
      name: entity.name,
      earned: this.formatCompactNumber(entity.earnedCoins),
      badge: entity.badge,
      ...(entity.isCurrentUser ? { isMe: true } : {}),
    }
  }

  toVoteView(entity: CommunityReviewVoteEntity) {
    return {
      _id: entity.id,
      submissionId: entity.submissionId,
      choice: entity.choice,
      rewardCoins: entity.rewardCoins,
    }
  }

  toVerificationStatsView(input: {
    awaiting: number
    reviewed: number
    totalEarnedCoins: number
    coinBalance: number
    queueCount: number
    rewardCoins: number
    activeReviewersThisWeek: number
  }): CommunityVerificationStatsView {
    return {
      awaiting: this.formatCompactNumber(input.awaiting),
      reviewed: this.formatCompactNumber(input.reviewed),
      totalEarned: this.formatCompactNumber(input.totalEarnedCoins),
      coinBalance: this.formatCompactNumber(input.coinBalance),
      queueCount: input.queueCount,
      rewardCoins: input.rewardCoins,
      activeReviewersThisWeek: input.activeReviewersThisWeek,
    }
  }

  private toPaginationView(page: {
    page: number
    limit: number
    total: number
    totalPages: number
  }): CommunityPaginationView {
    return {
      page: page.page,
      limit: page.limit,
      total: page.total,
      totalPages: page.totalPages,
      hasNextPage: page.page < page.totalPages,
      hasPreviousPage: page.page > 1,
    }
  }

  private formatCompactNumber(value: number): string {
    if (value >= 1000) {
      return `${Number((value / 1000).toFixed(1))}k`
    }

    return String(value)
  }

  private formatTimeLeft(expiresAt?: Date | null): string {
    if (!expiresAt) {
      return ''
    }

    const diffMs = expiresAt.getTime() - Date.now()

    if (diffMs <= 0) {
      return ''
    }

    const hours = Math.ceil(diffMs / (1000 * 60 * 60))

    if (hours >= 24) {
      return `${Math.ceil(hours / 24)}d`
    }

    return `${hours}h`
  }
}
