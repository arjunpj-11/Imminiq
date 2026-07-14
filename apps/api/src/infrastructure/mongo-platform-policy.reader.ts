import { AdminConsoleSettings } from './database/models/admin-console-settings.model';
import {
  resolvePlatformPolicy,
  type ActivityPolicy,
  type CommunityPolicy,
  type IActivityPolicyReader,
  type ICommunityPolicyReader,
  type ILeaderboardPolicyReader,
  type IMockTestPolicyReader,
  type ISecurityProductPolicyReader,
  type ITrackerPolicyReader,
  type LeaderboardPolicy,
  type MockTestPolicy,
  type PlatformPolicy,
  type SecurityProductPolicy,
  type TrackerPolicy,
} from '../shared/platform-policy';

type PlatformPolicyReader =
  & IActivityPolicyReader
  & ICommunityPolicyReader
  & ILeaderboardPolicyReader
  & IMockTestPolicyReader
  & ITrackerPolicyReader
  & ISecurityProductPolicyReader;

/** Mongo-backed adapter for product policy ports owned by the application modules. */
export class MongoPlatformPolicyReader implements PlatformPolicyReader {
  private async getPolicy(): Promise<PlatformPolicy> {
    const document = await AdminConsoleSettings.findOne({ key: 'global' })
      .select({ _id: 0, productPolicy: 1 })
      .lean();

    return resolvePlatformPolicy(document?.productPolicy as Partial<PlatformPolicy> | undefined);
  }

  async getActivityPolicy(): Promise<ActivityPolicy> {
    return (await this.getPolicy()).activity;
  }

  async getCommunityPolicy(): Promise<CommunityPolicy> {
    return (await this.getPolicy()).community;
  }

  async getLeaderboardPolicy(): Promise<LeaderboardPolicy> {
    return (await this.getPolicy()).leaderboard;
  }

  async getMockTestPolicy(): Promise<MockTestPolicy> {
    return (await this.getPolicy()).mockTests;
  }

  async getTrackerPolicy(): Promise<TrackerPolicy> {
    return (await this.getPolicy()).trackers;
  }

  async getSecurityProductPolicy(): Promise<SecurityProductPolicy> {
    return (await this.getPolicy()).security;
  }
}

export const mongoPlatformPolicyReader = new MongoPlatformPolicyReader();
