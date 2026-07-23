import type { ITrackerClanRepository, TrackerClanOverview } from '../../domain';
import type { ITrackerClanServiceContract } from '../tracker-clan.contract';
import type {
  DeleteClanSubtopicPayloadDTO,
  DeleteClanTopicPayloadDTO,
  ListClanMessagesPayloadDTO,
  RemoveClanMemberPayloadDTO,
  RespondToClanRoleInvitationPayloadDTO,
  ReviewClanJoinPayloadDTO,
  TrackerAccessPayloadDTO,
  TransferClanOwnershipPayloadDTO,
  UpdateClanMemberRolePayloadDTO,
  UpdateClanTopicPayloadDTO,
} from '../tracker.dto';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerClanNotificationService } from './tracker-clan-notification.service';

export class TrackerClanService implements ITrackerClanServiceContract {
  constructor(
    private readonly _clans: ITrackerClanRepository,
    private readonly _notificationService?: ITrackerClanNotificationService
  ) {}

  async getOverview(input: TrackerAccessPayloadDTO) {
    return this.requireOverview(await this._clans.getOverview(input));
  }

  async requestJoin(input: TrackerAccessPayloadDTO) {
    return this.requireOverview(
      await this._clans.requestJoin(input),
      'Clone this tracker into your dashboard before joining its clan'
    );
  }

  async reviewJoin(input: ReviewClanJoinPayloadDTO) {
    const beforeReview = await this._clans.getOverview({
      trackerId: input.trackerId,
      userId: input.userId,
    });
    const request = beforeReview?.joinRequests.find((item) => item.id === input.requestId);
    const overview = this.requireOverview(
      await this._clans.reviewJoin({
        trackerId: input.trackerId,
        reviewerId: input.userId,
        requestId: input.requestId,
        action: input.action,
      }),
      'Only the owner or a co-owner can review join requests'
    );
    await this._notificationService?.notifyJoinReview({
      trackerId: input.trackerId,
      request,
      action: input.action,
      overview,
    });
    return overview;
  }

  async updateMemberRole(input: UpdateClanMemberRolePayloadDTO) {
    const overview = this.requireOverview(
      await this._clans.updateMemberRole({
        trackerId: input.trackerId,
        ownerId: input.userId,
        memberId: input.memberId,
        role: input.role,
      }),
      'Only the owner can promote or demote clan members'
    );
    if (input.role === 'co_owner')
      await this._notificationService?.notifyRoleInvitation({
        trackerId: input.trackerId,
        userId: input.memberId,
        role: input.role,
        overview,
      });
    return overview;
  }

  async removeMember(input: RemoveClanMemberPayloadDTO) {
    return this.requireOverview(
      await this._clans.removeMember({
        trackerId: input.trackerId,
        actorId: input.userId,
        memberId: input.memberId,
      }),
      'You cannot remove this clan member'
    );
  }

  async leaveClan(input: TrackerAccessPayloadDTO) {
    const role = await this._clans.getRole(input);
    if (role === 'owner') {
      throw TrackerApplicationError.forbidden(
        'Transfer ownership to another guild member before leaving'
      );
    }
    return this.requireOverview(
      await this._clans.leaveClan(input),
      'Only a guild member or co-owner can leave this guild'
    );
  }

  async transferOwnership(input: TransferClanOwnershipPayloadDTO) {
    const overview = this.requireOverview(
      await this._clans.transferOwnership({
        trackerId: input.trackerId,
        ownerId: input.userId,
        newOwnerId: input.newOwnerId,
      }),
      'An ownership invitation can only be sent by the owner to an existing clan member'
    );
    await this._notificationService?.notifyRoleInvitation({
      trackerId: input.trackerId,
      userId: input.newOwnerId,
      role: 'owner',
      overview,
    });
    return overview;
  }

  async respondToRoleInvitation(input: RespondToClanRoleInvitationPayloadDTO) {
    const beforeResponse = await this._clans.getOverview({
      trackerId: input.trackerId,
      userId: input.userId,
    });
    const invitation = beforeResponse?.roleInvitations.find(
      (item) => item.id === input.invitationId && item.status === 'pending'
    );
    const overview = this.requireOverview(
      await this._clans.respondToRoleInvitation(input),
      'This role invitation is invalid or no longer pending'
    );
    await this._notificationService?.notifyRoleResponse({
      trackerId: input.trackerId,
      userId: input.userId,
      invitation,
      action: input.action,
      overview,
    });
    return overview;
  }

  async syncPersonalClone(input: TrackerAccessPayloadDTO) {
    const result = await this._clans.syncPersonalClone(input);
    if (!result) {
      throw TrackerApplicationError.forbidden(
        'A personal clone is required before guild changes can be fetched'
      );
    }
    return result;
  }

  async updateTopic(input: UpdateClanTopicPayloadDTO) {
    const updated = await this._clans.updateTopic({
      trackerId: input.trackerId,
      actorId: input.userId,
      topicId: input.topicId,
      title: input.title,
      description: input.description,
    });
    if (!updated) throw TrackerApplicationError.forbidden('Only clan managers can edit topics');
  }

  async deleteTopic(input: DeleteClanTopicPayloadDTO) {
    const deleted = await this._clans.deleteTopic({
      trackerId: input.trackerId,
      actorId: input.userId,
      topicId: input.topicId,
    });
    if (!deleted) throw TrackerApplicationError.forbidden('Only clan managers can delete topics');
  }

  async deleteSubtopic(input: DeleteClanSubtopicPayloadDTO) {
    const deleted = await this._clans.deleteSubtopic({
      trackerId: input.trackerId,
      actorId: input.userId,
      subtopicId: input.subtopicId,
    });
    if (!deleted)
      throw TrackerApplicationError.forbidden('Only clan managers can delete subtopics');
  }

  async listMessages(input: ListClanMessagesPayloadDTO) {
    const messages = await this._clans.listMessages({
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
