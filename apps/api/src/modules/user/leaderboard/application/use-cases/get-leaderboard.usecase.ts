import {
  LEADERBOARD_DEFAULT_LIMIT,
  LEADERBOARD_MAX_LIMIT,
  LEADERBOARD_MIN_LIMIT,
  LEADERBOARD_STREAK_CHAMPION_LIMIT,
} from '../../domain/leaderboard.constants';
import type { ILeaderboardQueryRepository } from '../../domain/repositories/leaderboard-query.repository.interface';
import { LEADERBOARD_SCORING_RULES, type LeaderboardReward } from '../leaderboard.constants';
import type {
  GetLeaderboardPayloadDTO,
  LeaderboardCurrentUserViewDTO,
  LeaderboardResponseDTO,
} from '../leaderboard.dto';
import { LeaderboardApplicationError } from '../leaderboard-application.error';
import type { ILeaderboardMapper } from '../leaderboard.mapper';
import type { ILeaderboardDateRange } from '../services/leaderboard-date-range.service';
import type { IClock } from '../../../../../shared/time/clock.interface';
import type { ILeaderboardPolicyReader, LeaderboardPolicy } from '../../../../../shared/platform-policy';
import type { LeaderboardSection } from '../../domain/value-objects/leaderboard-section.vo';

export interface IGetLeaderboardUseCase {
  execute(viewerUserId: string, payload: GetLeaderboardPayloadDTO): Promise<LeaderboardResponseDTO>;
}

export class GetLeaderboardUseCase implements IGetLeaderboardUseCase {
  constructor(
    private readonly _leaderboardRepository: ILeaderboardQueryRepository,
    private readonly _leaderboardMapper: ILeaderboardMapper,
    private readonly _dateRange: ILeaderboardDateRange,
    private readonly _clock: IClock,
    private readonly _policyReader: ILeaderboardPolicyReader
  ) {}

  async execute(
    viewerUserId: string,
    payload: GetLeaderboardPayloadDTO
  ): Promise<LeaderboardResponseDTO> {
    const limit = payload.limit ?? LEADERBOARD_DEFAULT_LIMIT;

    if (
      !Number.isInteger(limit) ||
      limit < LEADERBOARD_MIN_LIMIT ||
      limit > LEADERBOARD_MAX_LIMIT
    ) {
      throw LeaderboardApplicationError.invalidLimit(
        `Leaderboard limit must be between ${LEADERBOARD_MIN_LIMIT} and ${LEADERBOARD_MAX_LIMIT}`
      );
    }

    const now = this._clock.now();
    const periods = this._dateRange.getPeriods(now);
    const policy = await this._policyReader.getLeaderboardPolicy();

    const result = await this._leaderboardRepository.findLeaderboard({
      viewerUserId,
      section: payload.section,
      scope: payload.scope,
      limit,
      currentPeriod: periods.current,
      previousPeriod: periods.previous,
      previousSnapshotBefore: periods.previousSnapshotBefore,
      targetRank: policy.targetRank,
      streakChampionLimit: LEADERBOARD_STREAK_CHAMPION_LIMIT,
    });

    const topThree = result.topEntries
      .filter((entry) => entry.rank <= 3)
      .map((entry) => this._leaderboardMapper.toTopThreeView(entry, viewerUserId));

    const entries = result.topEntries
      .filter((entry) => entry.rank > 3)
      .map((entry) => this._leaderboardMapper.toEntryView(entry, viewerUserId));

    const currentUser = result.viewerEntry
      ? this.toCurrentUserView(
          result.viewerEntry,
          viewerUserId,
          result.targetRankScore,
          policy.targetRank
        )
      : null;

    const growthPercent = this.calculateGrowthPercent(
      result.weeklyScore,
      result.previousWeeklyScore
    );

    return {
      section: payload.section,
      scope: payload.scope,
      generatedAt: now.toISOString(),
      counts: {
        students: result.activeStudentCount,
        trainers: result.activeTrainerCount,
      },
      summary: {
        globalRank: result.globalViewerEntry?.rank ?? null,
        globalRankTrend: result.globalViewerEntry?.trend ?? 0,
      },
      topThree,
      entries,
      currentUser,
      streakChampions: result.streakChampions.map((entry) =>
        this._leaderboardMapper.toEntryView(entry, viewerUserId)
      ),
      weekly: {
        currentXp: result.weeklyScore,
        previousXp: result.previousWeeklyScore,
        growthPercent,
        tierTargetXp: policy.weeklyTierXp,
        xpToNextTier: Math.max(0, policy.weeklyTierXp - result.weeklyScore),
        progressPercent: Math.min(
          100,
          Math.round((result.weeklyScore / policy.weeklyTierXp) * 100)
        ),
      },
      scoringRules: LEADERBOARD_SCORING_RULES[payload.section],
      reward: this.getReward(payload.section, policy),
      pagination: {
        limit,
        returned: result.topEntries.length,
        participantCount: result.selectedParticipantCount,
      },
    };
  }

  private toCurrentUserView(
    entry: Parameters<ILeaderboardMapper['toEntryView']>[0],
    viewerUserId: string,
    targetRankScore: number | null,
    targetRank: number
  ): LeaderboardCurrentUserViewDTO {
    const view = this._leaderboardMapper.toEntryView(entry, viewerUserId);

    return {
      ...view,
      xpToTargetRank:
        targetRankScore === null || entry.rank <= targetRank
          ? entry.rank <= targetRank
            ? 0
            : null
          : Math.max(0, targetRankScore - entry.score + 1),
      targetRank,
    };
  }

  private getReward(section: LeaderboardSection, policy: LeaderboardPolicy): LeaderboardReward {
    const badgeName = section === 'students' ? policy.studentBadgeName : policy.trainerBadgeName;
    const coins = section === 'students' ? policy.studentRewardCoins : policy.trainerRewardCoins;

    return {
      title: 'Elite Distinction',
      description: `Reach the Top ${policy.targetRank} this week to unlock the ${badgeName} badge and ${coins} gold coins.`,
      targetRank: policy.targetRank,
      badgeName,
      coins,
    };
  }

  private calculateGrowthPercent(currentScore: number, previousScore: number): number {
    if (previousScore <= 0) {
      return currentScore > 0 ? 100 : 0;
    }

    return Math.round(((currentScore - previousScore) / previousScore) * 100);
  }
}
