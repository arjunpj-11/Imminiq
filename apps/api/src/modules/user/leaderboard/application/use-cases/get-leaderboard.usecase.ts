import {
  LEADERBOARD_DEFAULT_LIMIT,
  LEADERBOARD_MAX_LIMIT,
  LEADERBOARD_MIN_LIMIT,
  LEADERBOARD_STREAK_CHAMPION_LIMIT,
  LEADERBOARD_TARGET_RANK,
  LEADERBOARD_WEEKLY_TIER_XP,
} from '../../domain/leaderboard.constants'
import type { ILeaderboardQueryRepository } from '../../domain/repositories/leaderboard-query.repository.interface'
import {
  LEADERBOARD_REWARDS,
  LEADERBOARD_SCORING_RULES,
} from '../leaderboard.constants'
import type {
  GetLeaderboardPayloadDTO,
  LeaderboardCurrentUserViewDTO,
  LeaderboardResponseDTO,
} from '../leaderboard.dto'
import { LeaderboardApplicationError } from '../leaderboard-application.error'
import type { ILeaderboardMapper } from '../leaderboard.mapper'
import type { ILeaderboardDateRange } from '../services/leaderboard-date-range.service'
import type { IClock } from '../../../../../shared/time/clock.interface'

export interface IGetLeaderboardUseCase {
  execute(viewerUserId: string, payload: GetLeaderboardPayloadDTO): Promise<LeaderboardResponseDTO>
}

export class GetLeaderboardUseCase implements IGetLeaderboardUseCase {
  constructor(
    private readonly _leaderboardRepository: ILeaderboardQueryRepository,
    private readonly _leaderboardMapper: ILeaderboardMapper,
    private readonly _dateRange: ILeaderboardDateRange,
    private readonly _clock: IClock,
  ) {}

  async execute(
    viewerUserId: string,
    payload: GetLeaderboardPayloadDTO,
  ): Promise<LeaderboardResponseDTO> {
    const limit = payload.limit ?? LEADERBOARD_DEFAULT_LIMIT

    if (
      !Number.isInteger(limit) ||
      limit < LEADERBOARD_MIN_LIMIT ||
      limit > LEADERBOARD_MAX_LIMIT
    ) {
      throw LeaderboardApplicationError.invalidLimit(
        `Leaderboard limit must be between ${LEADERBOARD_MIN_LIMIT} and ${LEADERBOARD_MAX_LIMIT}`,
      )
    }

    const now = this._clock.now()
    const periods = this._dateRange.getPeriods(now)

    const result = await this._leaderboardRepository.findLeaderboard({
      viewerUserId,
      section: payload.section,
      scope: payload.scope,
      limit,
      currentPeriod: periods.current,
      previousPeriod: periods.previous,
      previousSnapshotBefore: periods.previousSnapshotBefore,
      targetRank: LEADERBOARD_TARGET_RANK,
      streakChampionLimit: LEADERBOARD_STREAK_CHAMPION_LIMIT,
    })

    const topThree = result.topEntries
      .filter((entry) => entry.rank <= 3)
      .map((entry) =>
        this._leaderboardMapper.toTopThreeView(entry, viewerUserId),
      )

    const entries = result.topEntries
      .filter((entry) => entry.rank > 3)
      .map((entry) =>
        this._leaderboardMapper.toEntryView(entry, viewerUserId),
      )

    const currentUser = result.viewerEntry
      ? this.toCurrentUserView(
          result.viewerEntry,
          viewerUserId,
          result.targetRankScore,
        )
      : null

    const growthPercent = this.calculateGrowthPercent(
      result.weeklyScore,
      result.previousWeeklyScore,
    )

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
        this._leaderboardMapper.toEntryView(entry, viewerUserId),
      ),
      weekly: {
        currentXp: result.weeklyScore,
        previousXp: result.previousWeeklyScore,
        growthPercent,
        tierTargetXp: LEADERBOARD_WEEKLY_TIER_XP,
        xpToNextTier: Math.max(
          0,
          LEADERBOARD_WEEKLY_TIER_XP - result.weeklyScore,
        ),
        progressPercent: Math.min(
          100,
          Math.round(
            (result.weeklyScore / LEADERBOARD_WEEKLY_TIER_XP) * 100,
          ),
        ),
      },
      scoringRules: LEADERBOARD_SCORING_RULES[payload.section],
      reward: LEADERBOARD_REWARDS[payload.section],
      pagination: {
        limit,
        returned: result.topEntries.length,
        participantCount: result.selectedParticipantCount,
      },
    }
  }

  private toCurrentUserView(
    entry: Parameters<ILeaderboardMapper['toEntryView']>[0],
    viewerUserId: string,
    targetRankScore: number | null,
  ): LeaderboardCurrentUserViewDTO {
    const view = this._leaderboardMapper.toEntryView(entry, viewerUserId)

    return {
      ...view,
      xpToTargetRank:
        targetRankScore === null || entry.rank <= LEADERBOARD_TARGET_RANK
          ? entry.rank <= LEADERBOARD_TARGET_RANK
            ? 0
            : null
          : Math.max(0, targetRankScore - entry.score + 1),
      targetRank: LEADERBOARD_TARGET_RANK,
    }
  }

  private calculateGrowthPercent(
    currentScore: number,
    previousScore: number,
  ): number {
    if (previousScore <= 0) {
      return currentScore > 0 ? 100 : 0
    }

    return Math.round(((currentScore - previousScore) / previousScore) * 100)
  }
}
