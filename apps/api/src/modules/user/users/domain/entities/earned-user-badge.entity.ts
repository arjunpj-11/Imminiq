import type { UserBadgeEntity } from './user-badge.entity'

export type EarnedUserBadgeEntityProps = {
  badge: UserBadgeEntity
  earnedAt?: Date | string | null
}

export class EarnedUserBadgeEntity {
  readonly badge: UserBadgeEntity
  readonly earnedAt?: Date | string | null

  constructor(props: EarnedUserBadgeEntityProps) {
    this.badge = props.badge
    if (props.earnedAt !== undefined) this.earnedAt = props.earnedAt
  }
}
