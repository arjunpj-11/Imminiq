export interface IAdminTrackerEmailProvider {
  sendTrackerDeleted(to: string, input: { ownerName: string; trackerTitle: string }): Promise<void>;
}
