export type UserStreakSnapshotEntityProps = {
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  totalFreezeUsed: number
}

export class UserStreakSnapshotEntity {
  readonly currentStreak: number
  readonly longestStreak: number
  readonly totalActiveDays: number
  readonly totalFreezeUsed: number

  constructor(props: UserStreakSnapshotEntityProps) {
    this.currentStreak = props.currentStreak
    this.longestStreak = props.longestStreak
    this.totalActiveDays = props.totalActiveDays
    this.totalFreezeUsed = props.totalFreezeUsed
  }
}
