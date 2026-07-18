import type {
  TrackerClanMessage,
  TrackerClanOverview,
  TrackerCloneSyncResult,
} from '../domain';

export interface ITrackerClanUseCaseContract {
  getOverview(input: { trackerId: string; userId: string }): Promise<TrackerClanOverview>;
  requestJoin(input: { trackerId: string; userId: string }): Promise<TrackerClanOverview>;
  reviewJoin(input: {
    trackerId: string;
    userId: string;
    requestId: string;
    action: 'approve' | 'reject';
  }): Promise<TrackerClanOverview>;
  updateMemberRole(input: {
    trackerId: string;
    userId: string;
    memberId: string;
    role: 'co_owner' | 'member';
  }): Promise<TrackerClanOverview>;
  removeMember(input: {
    trackerId: string;
    userId: string;
    memberId: string;
  }): Promise<TrackerClanOverview>;
  leaveClan(input: { trackerId: string; userId: string }): Promise<TrackerClanOverview>;
  transferOwnership(input: {
    trackerId: string;
    userId: string;
    newOwnerId: string;
  }): Promise<TrackerClanOverview>;
  respondToRoleInvitation(input: {
    trackerId: string;
    userId: string;
    invitationId: string;
    action: 'accept' | 'decline';
  }): Promise<TrackerClanOverview>;
  syncPersonalClone(input: {
    trackerId: string;
    userId: string;
  }): Promise<TrackerCloneSyncResult>;
  updateTopic(input: {
    trackerId: string;
    userId: string;
    topicId: string;
    title: string;
    description: string;
  }): Promise<void>;
  deleteTopic(input: { trackerId: string; userId: string; topicId: string }): Promise<void>;
  deleteSubtopic(input: {
    trackerId: string;
    userId: string;
    subtopicId: string;
  }): Promise<void>;
  listMessages(input: {
    trackerId: string;
    userId: string;
    limit?: number;
  }): Promise<TrackerClanMessage[]>;
}
