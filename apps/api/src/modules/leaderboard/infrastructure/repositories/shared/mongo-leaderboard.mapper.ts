import { LeaderboardEntryEntity } from '../../../domain/entities/leaderboard-entry.entity'
import type { LeaderboardSection } from '../../../domain/value-objects/leaderboard-section.vo'
import type {
  MongoIdLike,
  MongoRankedUserRecord,
} from './mongo-leaderboard.types'

export class MongoLeaderboardMapper {
  toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString()
  }

  toEntryEntity(
    record: MongoRankedUserRecord,
    section: LeaderboardSection,
    previousRank?: number | null,
  ): LeaderboardEntryEntity {
    return new LeaderboardEntryEntity({
      userId: this.toId(record._id),
      rank: record.rank,
      previousRank,
      fullName: record.fullName,
      username: record.username,
      avatarUrl: record.avatarUrl,
      section,
      score: Math.max(0, record.score),
      totalScore: Math.max(0, record.totalScore),
      level: Math.max(1, record.level),
      streakCount: Math.max(0, record.streakCount),
    })
  }
}
