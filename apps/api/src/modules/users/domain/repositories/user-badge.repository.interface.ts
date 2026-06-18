import type { EarnedUserBadgeEntity } from '../entities/earned-user-badge.entity'
import type { UserBadgeEntity } from '../entities/user-badge.entity'
import type { UserIdInput } from '../value-objects/user-id.vo'

export interface UserBadgeRepositoryContract {
  findBadgeShowcase(userId: UserIdInput): Promise<{
    catalog: UserBadgeEntity[]
    earned: EarnedUserBadgeEntity[]
  }>
  findEarnedBadgesPaginated(
    userId: UserIdInput,
    page?: number,
    limit?: number,
  ): Promise<{ items: EarnedUserBadgeEntity[]; total: number }>
}
