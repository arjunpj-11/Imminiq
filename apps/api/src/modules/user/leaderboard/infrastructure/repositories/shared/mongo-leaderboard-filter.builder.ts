import type { PipelineStage } from 'mongoose'

import type { LeaderboardSection } from '../../../domain/value-objects/leaderboard-section.vo'

const LEADERBOARD_RANK_SORT_KEY = '__leaderboardRankSortKey'

export class MongoLeaderboardFilterBuilder {
  static eligibleUser(
    section: LeaderboardSection,
    prefix = '',
  ): Record<string, unknown> {
    return {
      [`${prefix}status`]: 'active',
      [`${prefix}deletedAt`]: null,
      [`${prefix}role`]: {
        $nin: ['admin', 'superadmin'],
      },
      ...(section === 'trainers'
        ? {
            [`${prefix}teacherXp`]: {
              $gt: 0,
            },
          }
        : {}),
    }
  }

  static scoreField(section: LeaderboardSection, prefix = ''): string {
    return `${prefix}${section === 'students' ? 'xp' : 'teacherXp'}`
  }

  static levelField(section: LeaderboardSection, prefix = ''): string {
    return `${prefix}${section === 'students' ? 'level' : 'teacherLevel'}`
  }

  /**
   * $documentNumber only accepts one top-level sortBy field.
   *
   * To keep deterministic ranking, the real ranking fields are packed into
   * one temporary BSON object. MongoDB compares BSON object key/value pairs
   * in their stored order, so this produces:
   *
   * 1. score descending (stored as a negative number),
   * 2. createdAt ascending,
   * 3. _id ascending.
   */
  static totalRankingKeyStage(
    section: LeaderboardSection,
  ): PipelineStage.Set {
    return this.rankingKeyStage(this.scoreField(section), 'createdAt')
  }

  static weeklyRankingKeyStage(): PipelineStage.Set {
    return this.rankingKeyStage('score', 'createdAt')
  }

  static rankingWindowSort(): Record<string, 1> {
    return {
      [LEADERBOARD_RANK_SORT_KEY]: 1,
    }
  }

  static removeRankingKeyStage(): PipelineStage.Unset {
    return {
      $unset: LEADERBOARD_RANK_SORT_KEY,
    }
  }

  private static rankingKeyStage(
    scoreField: string,
    createdAtField: string,
  ): PipelineStage.Set {
    return {
      $set: {
        [LEADERBOARD_RANK_SORT_KEY]: {
          score: {
            $multiply: [-1, { $ifNull: [`$${scoreField}`, 0] }],
          },
          createdAt: {
            $ifNull: [`$${createdAtField}`, new Date(0)],
          },
          id: {
            $toString: '$_id',
          },
        },
      },
    }
  }
}
