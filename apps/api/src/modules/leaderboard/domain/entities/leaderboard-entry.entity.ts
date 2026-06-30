import type { LeaderboardSection } from '../value-objects/leaderboard-section.vo'

export type LeaderboardEntryEntityProps = {
  userId: string
  rank: number
  previousRank: number | null | undefined
  fullName: string
  username: string
  avatarUrl: string | null | undefined
  section: LeaderboardSection
  score: number
  totalScore: number
  level: number
  streakCount: number
}

export class LeaderboardEntryEntity {
  readonly userId: string
  readonly rank: number
  readonly previousRank: number | null | undefined
  readonly fullName: string
  readonly username: string
  readonly avatarUrl: string | null | undefined
  readonly section: LeaderboardSection
  readonly score: number
  readonly totalScore: number
  readonly level: number
  readonly streakCount: number

  constructor(props: LeaderboardEntryEntityProps) {
    this.userId = props.userId
    this.rank = props.rank
    this.previousRank = props.previousRank
    this.fullName = props.fullName
    this.username = props.username
    this.avatarUrl = props.avatarUrl
    this.section = props.section
    this.score = props.score
    this.totalScore = props.totalScore
    this.level = props.level
    this.streakCount = props.streakCount
  }

  get trend(): number {
    if (this.previousRank === null || this.previousRank === undefined) {
      return 0
    }

    return this.previousRank - this.rank
  }
}
