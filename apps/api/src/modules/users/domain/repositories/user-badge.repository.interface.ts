import type { EarnedUserBadgeEntity } from '../entities/earned-user-badge.entity'
import type { UserBadgeEntity } from '../entities/user-badge.entity'
import type { UserIdInput } from '../value-objects/user-id.vo'

export type UserBadgeShowcaseResult = {
  catalog: UserBadgeEntity[]
  earned: EarnedUserBadgeEntity[]
}

export type EarnedUserBadgeListResult = {
  items: EarnedUserBadgeEntity[]
  total: number
}

export type FindEarnedUserBadgesPaginatedInput = {
  userId: UserIdInput
  page?: number
  limit?: number
}

export interface UserBadgeRepositoryContract {
  findBadgeShowcase(userId: UserIdInput): Promise<UserBadgeShowcaseResult>

  findEarnedBadgesPaginated(
    input: FindEarnedUserBadgesPaginatedInput
  ): Promise<EarnedUserBadgeListResult>
}