export interface IFriendBlockRepository {
  listBlockedByUserIds(viewerUserId: string): Promise<string[]>;
}
