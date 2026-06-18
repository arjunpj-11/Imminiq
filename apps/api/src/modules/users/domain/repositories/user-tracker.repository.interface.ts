import type { PublishedTrackerEntity } from '../entities/published-tracker.entity'
import type { PublishedTrackerQuery } from '../value-objects/published-tracker-query.vo'
import type { UserIdInput } from '../value-objects/user-id.vo'

export interface UserTrackerRepositoryContract {
  findPublishedTrackers(
    ownerId: UserIdInput,
    query: PublishedTrackerQuery,
    includePrivate?: boolean,
  ): Promise<{ items: PublishedTrackerEntity[]; total: number }>
}
