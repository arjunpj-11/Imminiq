export interface IChatRelationshipRepository {
  areActiveFriends(firstUserId: string, secondUserId: string): Promise<boolean>;
}
