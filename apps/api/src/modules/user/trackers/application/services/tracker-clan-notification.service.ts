import type {
  ITrackerClanNotificationNotifier,
  TrackerClanJoinRequest,
  TrackerClanOverview,
  TrackerClanRoleInvitation,
} from '../../domain';

type JoinReviewInput = {
  trackerId: string;
  request: TrackerClanJoinRequest | undefined;
  action: 'approve' | 'reject';
  overview: TrackerClanOverview;
};

type RoleInvitationInput = {
  trackerId: string;
  userId: string;
  role: 'co_owner' | 'owner';
  overview: TrackerClanOverview;
};

type RoleResponseInput = {
  trackerId: string;
  userId: string;
  invitation: TrackerClanRoleInvitation | undefined;
  action: 'accept' | 'decline';
  overview: TrackerClanOverview;
};

export interface ITrackerClanNotificationService {
  notifyJoinReview(input: JoinReviewInput): Promise<void>;
  notifyRoleInvitation(input: RoleInvitationInput): Promise<void>;
  notifyRoleResponse(input: RoleResponseInput): Promise<void>;
}

export class TrackerClanNotificationService implements ITrackerClanNotificationService {
  constructor(private readonly _notifier?: ITrackerClanNotificationNotifier) {}

  async notifyJoinReview(input: JoinReviewInput) {
    if (!input.request) return;
    await this._notifier?.notify({
      userId: input.request.userId,
      type: 'tracker_clan_join_reviewed',
      message:
        input.action === 'approve'
          ? `Your request to join “${input.overview.trackerTitle}” was approved.`
          : `Your request to join “${input.overview.trackerTitle}” was declined.`,
      deepLink: `/trackers/${input.trackerId}/clan`,
      eventId: `${input.request.id}:${input.action}`,
      metadata: { trackerId: input.trackerId, requestId: input.request.id },
    });
  }

  async notifyRoleInvitation(input: RoleInvitationInput) {
    const invitation = input.overview.roleInvitations.find(
      (item) =>
        item.userId === input.userId && item.role === input.role && item.status === 'pending'
    );
    if (!invitation) return;
    await this._notifier?.notify({
      userId: input.userId,
      type: 'tracker_clan_role_invitation',
      message:
        input.role === 'owner'
          ? `You were invited to become the owner of “${input.overview.trackerTitle}”.`
          : `You were invited to become a co-owner of “${input.overview.trackerTitle}”.`,
      deepLink: `/trackers/${input.trackerId}/clan`,
      eventId: invitation.id,
      metadata: {
        trackerId: input.trackerId,
        invitationId: invitation.id,
        role: invitation.role,
      },
    });
  }

  async notifyRoleResponse(input: RoleResponseInput) {
    if (!input.invitation) return;
    const member = input.overview.members.find((item) => item.userId === input.userId);
    await this._notifier?.notify({
      userId: input.invitation.invitedBy.userId,
      type: 'tracker_clan_role_invitation_response',
      message: `${member?.name ?? 'A guild member'} ${input.action === 'accept' ? 'accepted' : 'declined'} your ${input.invitation.role === 'owner' ? 'ownership' : 'co-owner'} invitation for “${input.overview.trackerTitle}”.`,
      deepLink: `/trackers/${input.trackerId}/clan`,
      eventId: `${input.invitation.id}:${input.action}`,
      metadata: {
        trackerId: input.trackerId,
        invitationId: input.invitation.id,
        action: input.action,
      },
    });
  }
}
