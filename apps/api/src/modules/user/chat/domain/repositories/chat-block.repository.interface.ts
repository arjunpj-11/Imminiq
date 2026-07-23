export interface IChatBlockRepository {
  hasBlockBetween(firstUserId: string, secondUserId: string): Promise<boolean>;
  listBlockedUserIds(blockerUserId: string): Promise<string[]>;
  listBlockedByUserIds(blockedUserId: string): Promise<string[]>;
  blockUser(blockerUserId: string, blockedUserId: string): Promise<void>;
  unblockUser(blockerUserId: string, blockedUserId: string): Promise<boolean>;
}
