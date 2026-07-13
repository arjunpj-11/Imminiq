import type { LeaderboardEntryEntity } from '../domain/entities/leaderboard-entry.entity'
import type {
  LeaderboardEntryViewDTO,
  LeaderboardTopThreeViewDTO,
} from './leaderboard.dto'

const AVATAR_COLORS = [
  '#b84c2b',
  '#c49a2c',
  '#2d6a47',
  '#5c4a3a',
  '#3a4a5c',
  '#4a5c3a',
  '#7c3a2d',
  '#2d5c7c',
  '#5c3a6b',
  '#6b5a2d',
] as const

export interface ILeaderboardMapper {
  toEntryView(
    entry: LeaderboardEntryEntity,
    viewerUserId: string,
  ): LeaderboardEntryViewDTO

  toTopThreeView(
    entry: LeaderboardEntryEntity,
    viewerUserId: string,
  ): LeaderboardTopThreeViewDTO
}

export class LeaderboardMapper implements ILeaderboardMapper {
  toEntryView(
    entry: LeaderboardEntryEntity,
    viewerUserId: string,
  ): LeaderboardEntryViewDTO {
    return {
      userId: entry.userId,
      rank: entry.rank,
      name: entry.fullName,
      username: entry.username,
      handle: `@${entry.username}`,
      track:
        entry.section === 'students'
          ? `Level ${entry.level}`
          : `Trainer Lv. ${entry.level}`,
      xp: entry.score,
      totalXp: entry.totalScore,
      level: entry.level,
      streak: entry.streakCount,
      trend: entry.trend,
      avatarUrl: entry.avatarUrl,
      avatarColor: this.getAvatarColor(entry.userId),
      initials: this.getInitials(entry.fullName),
      isMe: entry.userId === viewerUserId,
    }
  }

  toTopThreeView(
    entry: LeaderboardEntryEntity,
    viewerUserId: string,
  ): LeaderboardTopThreeViewDTO {
    const view = this.toEntryView(entry, viewerUserId)

    return {
      ...view,
      rank: entry.rank as 1 | 2 | 3,
      streakDays: entry.streakCount,
      isChampion: entry.rank === 1,
    }
  }

  private getInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  private getAvatarColor(seed: string): string {
    let hash = 0

    for (const character of seed) {
      hash = (hash * 31 + character.charCodeAt(0)) >>> 0
    }

    return AVATAR_COLORS[hash % AVATAR_COLORS.length]
  }
}
