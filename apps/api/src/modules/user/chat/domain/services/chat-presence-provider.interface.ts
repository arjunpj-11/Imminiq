export interface IChatPresenceProvider {
  isOnline(userId: string): boolean;
}
