export interface ICallRelationshipRepository {
  areActiveFriends(firstUserId: string, secondUserId: string): Promise<boolean>;
  hasBlockBetween(firstUserId: string, secondUserId: string): Promise<boolean>;
}
