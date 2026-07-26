import type {
  TrackerClanMessagePage,
  TrackerClanOverview,
  TrackerClanRole,
  TrackerCloneSyncResult,
} from '../tracker-clan.types';

export interface ITrackerClanRepository {
  getOverview(input: { trackerId: string; userId: string }): Promise<TrackerClanOverview | null>;
  getRole(input: { trackerId: string; userId: string }): Promise<TrackerClanRole | null>;
  requestJoin(input: { trackerId: string; userId: string }): Promise<TrackerClanOverview | null>;
  reviewJoin(input: {
    trackerId: string;
    reviewerId: string;
    requestId: string;
    action: 'approve' | 'reject';
  }): Promise<TrackerClanOverview | null>;
  updateMemberRole(input: {
    trackerId: string;
    ownerId: string;
    memberId: string;
    role: 'co_owner' | 'member';
  }): Promise<TrackerClanOverview | null>;
  removeMember(input: {
    trackerId: string;
    actorId: string;
    memberId: string;
  }): Promise<TrackerClanOverview | null>;
  leaveClan(input: { trackerId: string; userId: string }): Promise<TrackerClanOverview | null>;
  transferOwnership(input: {
    trackerId: string;
    ownerId: string;
    newOwnerId: string;
  }): Promise<TrackerClanOverview | null>;
  respondToRoleInvitation(input: {
    trackerId: string;
    userId: string;
    invitationId: string;
    action: 'accept' | 'decline';
  }): Promise<TrackerClanOverview | null>;
  syncPersonalClone(input: {
    trackerId: string;
    userId: string;
  }): Promise<TrackerCloneSyncResult | null>;
  updateTopic(input: {
    trackerId: string;
    actorId: string;
    topicId: string;
    title: string;
    description: string;
  }): Promise<boolean>;
  deleteTopic(input: { trackerId: string; actorId: string; topicId: string }): Promise<boolean>;
  deleteSubtopic(input: {
    trackerId: string;
    actorId: string;
    subtopicId: string;
  }): Promise<boolean>;
  listMessages(input: {
    trackerId: string;
    userId: string;
    limit: number;
    before?: string;
  }): Promise<TrackerClanMessagePage | null>;
}
