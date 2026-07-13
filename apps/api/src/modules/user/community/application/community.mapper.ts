import type { CommunityLeaderboardEntryEntity } from '../domain/entities/community-leaderboard-entry.entity';
import type { CommunityMemberStatsEntity } from '../domain/entities/community-member-stats.entity';
import type { CommunityReviewVoteEntity } from '../domain/entities/community-review-vote.entity';
import type { CommunityTrackerEntity } from '../domain/entities/community-tracker.entity';
import type { CommunityVerificationSubmissionEntity } from '../domain/entities/community-verification-submission.entity';
import type { CommunityTrackerPageResult } from '../domain/repositories/community-tracker.repository.interface';
import type { VerificationQueueResult } from '../domain/repositories/community-verification.repository.interface';
import type {
  ICommunityLeaderboardEntryViewDTO,
  ICommunityPaginationViewDTO,
  ICommunityStatCardViewDTO,
  ICommunityTrackerListViewDTO,
  ICommunityTrackerViewDTO,
  ICommunityVerificationQueueViewDTO,
  ICommunityVerificationSubmissionViewDTO,
  ICommunityVerificationStatsViewDTO,
  ICommunityVerifyItemViewDTO,
} from './community.dto';
import type { IClock } from '../../../../shared/time/clock.interface';

export interface ICommunityMapper {
  toTrackerView(entity: CommunityTrackerEntity): ICommunityTrackerViewDTO;
  toTrackerListView(page: CommunityTrackerPageResult): ICommunityTrackerListViewDTO;
  toStatCards(entity: CommunityMemberStatsEntity): ICommunityStatCardViewDTO[];
  toVerifyItemView(entity: CommunityVerificationSubmissionEntity): ICommunityVerifyItemViewDTO;
  toVerificationSubmissionView(
    entity: CommunityVerificationSubmissionEntity
  ): ICommunityVerificationSubmissionViewDTO;
  toVerificationQueueView(page: VerificationQueueResult): ICommunityVerificationQueueViewDTO;
  toLeaderboardEntryView(
    entity: CommunityLeaderboardEntryEntity
  ): ICommunityLeaderboardEntryViewDTO;
  toVoteView(entity: CommunityReviewVoteEntity): {
    _id: string;
    submissionId: string;
    choice: CommunityReviewVoteEntity['choice'];
    rewardCoins: number;
  };
  toVerificationStatsView(input: {
    awaiting: number;
    reviewed: number;
    totalEarnedCoins: number;
    coinBalance: number;
    queueCount: number;
    rewardCoins: number;
    activeReviewersThisWeek: number;
  }): ICommunityVerificationStatsViewDTO;
}

export class CommunityMapper implements ICommunityMapper {
  constructor(private readonly clock: IClock) {}

  toTrackerView(entity: CommunityTrackerEntity): ICommunityTrackerViewDTO {
    return {
      _id: entity.id,
      title: entity.title,
      description: entity.description,
      rating: Number(entity.rating.toFixed(1)),
      clones: entity.clones,
      verified: entity.verified,
      inDashboard: entity.inDashboard,
      topic: entity.topic,
    };
  }

  toTrackerListView(page: CommunityTrackerPageResult): ICommunityTrackerListViewDTO {
    return {
      trackers: page.items.map((item) => this.toTrackerView(item)),
      pagination: this.toPaginationView(page),
    };
  }

  toStatCards(entity: CommunityMemberStatsEntity): ICommunityStatCardViewDTO[] {
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
    ];
  }

  toVerifyItemView(entity: CommunityVerificationSubmissionEntity): ICommunityVerifyItemViewDTO {
    return {
      _id: entity.id,
      title: entity.title,
      category: entity.category,
      timeLeft: entity.timeLeftAt(this.clock.now()),
      excerpt: entity.excerpt,
      progress: entity.progress,
      passVotes: entity.passVotes,
      failVotes: entity.failVotes,
      requiredVotes: entity.requiredVotes,
      votedPass: entity.votedPass,
      closed: entity.closed,
      urgent: entity.urgent,
    };
  }

  toVerificationSubmissionView(
    entity: CommunityVerificationSubmissionEntity
  ): ICommunityVerificationSubmissionViewDTO {
    return {
      ...this.toVerifyItemView(entity),
      trackerId: entity.trackerId,
      ownerId: entity.ownerId,
      userVote: entity.userVote ?? null,
      failVotes: entity.failVotes,
      reviewTracker: entity.reviewTracker,
      consensusChoice: entity.consensusChoice ?? null,
    };
  }

  toVerificationQueueView(page: VerificationQueueResult): ICommunityVerificationQueueViewDTO {
    return {
      items: page.items.map((item) => this.toVerifyItemView(item)),
      pagination: this.toPaginationView(page),
    };
  }

  toLeaderboardEntryView(
    entity: CommunityLeaderboardEntryEntity
  ): ICommunityLeaderboardEntryViewDTO {
    return {
      rank: entity.rank,
      name: entity.name,
      earned: this.formatCompactNumber(entity.earnedCoins),
      badge: entity.badge,
      ...(entity.isCurrentUser ? { isMe: true } : {}),
    };
  }

  toVoteView(entity: CommunityReviewVoteEntity) {
    return {
      _id: entity.id,
      submissionId: entity.submissionId,
      choice: entity.choice,
      rewardCoins: entity.rewardCoins,
    };
  }

  toVerificationStatsView(input: {
    awaiting: number;
    reviewed: number;
    totalEarnedCoins: number;
    coinBalance: number;
    queueCount: number;
    rewardCoins: number;
    activeReviewersThisWeek: number;
  }): ICommunityVerificationStatsViewDTO {
    return {
      awaiting: this.formatCompactNumber(input.awaiting),
      reviewed: this.formatCompactNumber(input.reviewed),
      totalEarned: this.formatCompactNumber(input.totalEarnedCoins),
      coinBalance: this.formatCompactNumber(input.coinBalance),
      queueCount: input.queueCount,
      rewardCoins: input.rewardCoins,
      activeReviewersThisWeek: input.activeReviewersThisWeek,
    };
  }

  private toPaginationView(page: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }): ICommunityPaginationViewDTO {
    return {
      page: page.page,
      limit: page.limit,
      total: page.total,
      totalPages: page.totalPages,
      hasNextPage: page.page < page.totalPages,
      hasPreviousPage: page.page > 1,
    };
  }

  private formatCompactNumber(value: number): string {
    if (value >= 1000) {
      return `${Number((value / 1000).toFixed(1))}k`;
    }

    return String(value);
  }
}
