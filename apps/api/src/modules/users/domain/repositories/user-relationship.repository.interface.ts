import type { RelationshipState } from '../value-objects/relationship-state.vo'
import type { UserIdInput } from '../value-objects/user-id.vo'

export type GetRelationshipStateInput = {
  viewerUserId?: string
  targetUserId: UserIdInput
}

export interface UserRelationshipRepositoryContract {
  getRelationshipState(
    input: GetRelationshipStateInput
  ): Promise<RelationshipState>
}