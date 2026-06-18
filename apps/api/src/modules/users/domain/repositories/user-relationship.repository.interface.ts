import type { RelationshipState } from '../value-objects/relationship-state.vo'
import type { UserIdInput } from '../value-objects/user-id.vo'

export interface UserRelationshipRepositoryContract {
  getRelationshipState(
    viewerUserId: string | undefined,
    targetUserId: UserIdInput,
  ): Promise<RelationshipState>
}
