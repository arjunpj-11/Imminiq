import type {
  ITrackerClanRepository,
  TrackerClanOverview,
  TrackerClanMessage,
} from '../../domain';
import { TrackerApplicationError } from '../tracker-application.error';

export interface ITrackerClanUseCase {
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
  updateTopic(input: {
    trackerId: string;
    userId: string;
    topicId: string;
    title: string;
    description: string;
  }): Promise<void>;
  deleteTopic(input: {
    trackerId: string;
    userId: string;
    topicId: string;
  }): Promise<void>;
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

export class TrackerClanUseCase implements ITrackerClanUseCase {
  constructor(private readonly clans: ITrackerClanRepository) {}

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
    return this.requireOverview(
      await this.clans.reviewJoin({
        trackerId: input.trackerId,
        reviewerId: input.userId,
        requestId: input.requestId,
        action: input.action,
      }),
      'Only the owner or a co-owner can review join requests'
    );
  }

  async updateMemberRole(input: {
    trackerId: string;
    userId: string;
    memberId: string;
    role: 'co_owner' | 'member';
  }) {
    return this.requireOverview(
      await this.clans.updateMemberRole({
        trackerId: input.trackerId,
        ownerId: input.userId,
        memberId: input.memberId,
        role: input.role,
      }),
      'Only the owner can promote or demote clan members'
    );
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
    return this.requireOverview(
      await this.clans.transferOwnership({
        trackerId: input.trackerId,
        ownerId: input.userId,
        newOwnerId: input.newOwnerId,
      }),
      'Ownership can only be transferred by the owner to an existing clan member'
    );
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
