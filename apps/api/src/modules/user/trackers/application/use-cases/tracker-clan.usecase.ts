import type {
  ITrackerClanRepository,
  ITrackerClanNotificationNotifier,
  TrackerClanOverview,
} from '../../domain';
import type { ITrackerClanUseCaseContract } from '../tracker-clan.contract';
import { TrackerApplicationError } from '../tracker-application.error';
import { TrackerClanNotificationService } from '../services/tracker-clan-notification.service';

export interface ITrackerClanUseCase extends ITrackerClanUseCaseContract {
  getOverview(input: { trackerId: string; userId: string }): Promise<TrackerClanOverview>;
}

export class TrackerClanUseCase implements ITrackerClanUseCase {
  private readonly notificationService: TrackerClanNotificationService;

  constructor(
    private readonly clans: ITrackerClanRepository,
    notifications?: ITrackerClanNotificationNotifier
  ) {
    this.notificationService = new TrackerClanNotificationService(notifications);
  }

  async getOverview(input: { trackerId: string; userId: string }) {
    return this.requireOverview(await this.clans.getOverview(input));
  }

  async requestJoin(input: { trackerId: string; userId: string }) {
    return this.requireOverview(
      await this.clans.requestJoin(input),
      'Clone this tracker into your dashboard before joining its clan'
    );
  }

  async reviewJoin(input: {
    trackerId: string;
    userId: string;
    requestId: string;
    action: 'approve' | 'reject';
  }) {
    const beforeReview = await this.clans.getOverview({
      trackerId: input.trackerId,
      userId: input.userId,
    });
    const request = beforeReview?.joinRequests.find((item) => item.id === input.requestId);
    const overview = this.requireOverview(
      await this.clans.reviewJoin({
        trackerId: input.trackerId,
        reviewerId: input.userId,
        requestId: input.requestId,
        action: input.action,
      }),
      'Only the owner or a co-owner can review join requests'
    );
    await this.notificationService.notifyJoinReview({
      trackerId: input.trackerId,
      request,
      action: input.action,
      overview,
    });
    return overview;
  }

  async updateMemberRole(input: {
    trackerId: string;
    userId: string;
    memberId: string;
    role: 'co_owner' | 'member';
  }) {
    const overview = this.requireOverview(
      await this.clans.updateMemberRole({
        trackerId: input.trackerId,
        ownerId: input.userId,
        memberId: input.memberId,
        role: input.role,
      }),
      'Only the owner can promote or demote clan members'
    );
    if (input.role === 'co_owner')
      await this.notificationService.notifyRoleInvitation({
        trackerId: input.trackerId,
        userId: input.memberId,
        role: input.role,
        overview,
      });
    return overview;
  }

  async removeMember(input: { trackerId: string; userId: string; memberId: string }) {
    return this.requireOverview(
      await this.clans.removeMember({
        trackerId: input.trackerId,
        actorId: input.userId,
        memberId: input.memberId,
      }),
      'You cannot remove this clan member'
    );
  }

  async leaveClan(input: { trackerId: string; userId: string }) {
    const role = await this.clans.getRole(input);
    if (role === 'owner') {
      throw TrackerApplicationError.forbidden(
        'Transfer ownership to another guild member before leaving'
      );
    }
    return this.requireOverview(
      await this.clans.leaveClan(input),
      'Only a guild member or co-owner can leave this guild'
    );
  }

  async transferOwnership(input: { trackerId: string; userId: string; newOwnerId: string }) {
    const overview = this.requireOverview(
      await this.clans.transferOwnership({
        trackerId: input.trackerId,
        ownerId: input.userId,
        newOwnerId: input.newOwnerId,
      }),
      'An ownership invitation can only be sent by the owner to an existing clan member'
    );
    await this.notificationService.notifyRoleInvitation({
      trackerId: input.trackerId,
      userId: input.newOwnerId,
      role: 'owner',
      overview,
    });
    return overview;
  }

  async respondToRoleInvitation(input: {
    trackerId: string;
    userId: string;
    invitationId: string;
    action: 'accept' | 'decline';
  }) {
    const beforeResponse = await this.clans.getOverview({
      trackerId: input.trackerId,
      userId: input.userId,
    });
    const invitation = beforeResponse?.roleInvitations.find(
      (item) => item.id === input.invitationId && item.status === 'pending'
    );
    const overview = this.requireOverview(
      await this.clans.respondToRoleInvitation(input),
      'This role invitation is invalid or no longer pending'
    );
    await this.notificationService.notifyRoleResponse({
      trackerId: input.trackerId,
      userId: input.userId,
      invitation,
      action: input.action,
      overview,
    });
    return overview;
  }

  async syncPersonalClone(input: { trackerId: string; userId: string }) {
    const result = await this.clans.syncPersonalClone(input);
    if (!result) {
      throw TrackerApplicationError.forbidden(
        'A personal clone is required before guild changes can be fetched'
      );
    }
    return result;
  }

  async updateTopic(input: {
    trackerId: string;
    userId: string;
    topicId: string;
    title: string;
    description: string;
  }) {
    const updated = await this.clans.updateTopic({
      trackerId: input.trackerId,
      actorId: input.userId,
      topicId: input.topicId,
      title: input.title,
      description: input.description,
    });
    if (!updated) throw TrackerApplicationError.forbidden('Only clan managers can edit topics');
  }

  async deleteTopic(input: { trackerId: string; userId: string; topicId: string }) {
    const deleted = await this.clans.deleteTopic({
      trackerId: input.trackerId,
      actorId: input.userId,
      topicId: input.topicId,
    });
    if (!deleted) throw TrackerApplicationError.forbidden('Only clan managers can delete topics');
  }

  async deleteSubtopic(input: { trackerId: string; userId: string; subtopicId: string }) {
    const deleted = await this.clans.deleteSubtopic({
      trackerId: input.trackerId,
      actorId: input.userId,
      subtopicId: input.subtopicId,
    });
    if (!deleted) throw TrackerApplicationError.forbidden('Only clan managers can delete subtopics');
  }

  async listMessages(input: { trackerId: string; userId: string; limit?: number }) {
    const messages = await this.clans.listMessages({
      trackerId: input.trackerId,
      userId: input.userId,
      limit: Math.min(100, Math.max(1, input.limit ?? 60)),
    });
    if (!messages) throw TrackerApplicationError.forbidden('Join this guild to read its chat');
    return messages;
  }

  private requireOverview(value: TrackerClanOverview | null, message?: string) {
    if (!value) {
      if (message) throw TrackerApplicationError.forbidden(message);
      throw TrackerApplicationError.trackerNotFound();
    }
    return value;
  }
}
