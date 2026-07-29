export interface IAdminUserRealtimeAccessProvider {
  disconnectUser(userId: string): Promise<void>;
}
