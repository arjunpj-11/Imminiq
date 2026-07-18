export interface ITrackerPersonalCloneProvisioner {
  ensureClone(input: {
    trackerId: string;
    userId: string;
    bypassClonePermission?: boolean;
  }): Promise<boolean>;
}
