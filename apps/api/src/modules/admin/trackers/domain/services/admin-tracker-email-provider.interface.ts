export interface IAdminTrackerEmailProvider {
  queueTrackerModeration(input: {
    to: string;
    ownerName: string;
    trackerTitle: string;
    action: 'suspended' | 'deleted' | 'restored';
    reason: string;
  }): Promise<void>;
}
