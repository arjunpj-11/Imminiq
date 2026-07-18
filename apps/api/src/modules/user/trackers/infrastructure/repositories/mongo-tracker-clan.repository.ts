import mongoose, { Types } from 'mongoose';

import { TrackerClan } from '../../../../../infrastructure/database/models/tracker-clan.model';
import { TrackerClanChallenge as TrackerClanChallengeModel } from '../../../../../infrastructure/database/models/tracker-clan-challenge.model';
import {
  TRACKER_CLAN_MESSAGE_RETENTION_SECONDS,
  TrackerClanMessage,
} from '../../../../../infrastructure/database/models/tracker-clan-message.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { TrackerSubtopic } from '../../../../../infrastructure/database/models/tracker-subtopic.model';
import { TrackerTopic } from '../../../../../infrastructure/database/models/tracker-topic.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import { mongoCommunityRepository, type ICommunityTrackerRepository } from '../../../community';
import type {
  ITrackerClanRepository,
  ITrackerClanChallengeRepository,
  TrackerClanOverview,
  TrackerClanChallenge,
  TrackerClanRole,
  TrackerClanMessage as TrackerClanMessageRecord,
} from '../../domain';

type ClanLean = {
  trackerId: unknown;
  members: Array<{ userId: unknown; role: 'co_owner' | 'member'; joinedAt: Date }>;
  joinRequests: Array<{
    _id: unknown;
    userId: unknown;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
  }>;
};

type UserLean = {
  _id: unknown;
  fullName?: string;
  username?: string;
  avatarUrl?: string | null;
};

type TrackerLean = {
  _id: unknown;
  ownerId: unknown;
  title: string;
  description?: string;
  topicsCount?: number;
  subtopicsCount?: number;
  visibility?: 'private' | 'public';
  publishedAt?: Date | null;
  createdAt: Date;
};

type ChallengeSubmissionLean = {
  answers: Array<{ questionId: unknown; answer: string }>;
  score: number;
  submittedAt: Date;
};

type ChallengeLean = {
  _id: unknown;
  trackerId: unknown;
  challengerId: unknown;
  opponentId?: unknown | null;
  challengeType: 'open' | 'direct';
  status: 'open' | 'pending' | 'active' | 'completed' | 'declined' | 'cancelled' | 'expired';
  durationMinutes: number;
  questions: Array<{
    _id: unknown;
    prompt: string;
    options: string[];
    correctAnswer?: string;
    topicTitle: string;
    points: number;
  }>;
  challengerSubmission?: ChallengeSubmissionLean | null;
  opponentSubmission?: ChallengeSubmissionLean | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  acceptBy: Date;
  completedAt?: Date | null;
  winnerId?: unknown | null;
  createdAt: Date;
};

const objectId = (value: string) =>
  Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;

class OwnershipTransferConflict extends Error {}

export class MongoTrackerClanRepository
  implements ITrackerClanRepository, ITrackerClanChallengeRepository
{
  constructor(
    private readonly personalClones: Pick<ICommunityTrackerRepository, 'cloneTrackerForUser'> =
      mongoCommunityRepository
  ) {}

  async getRole(input: { trackerId: string; userId: string }): Promise<TrackerClanRole | null> {
    const trackerId = objectId(input.trackerId);
    const userId = objectId(input.userId);
    if (!trackerId || !userId) return null;
    const tracker = await Tracker.findOne({ _id: trackerId, deletedAt: null })
      .select('ownerId visibility publishedAt')
      .lean();
    if (!tracker) return null;
    if (String(tracker.ownerId) === input.userId) return 'owner';
    const clan = (await TrackerClan.findOne({ trackerId }).lean()) as ClanLean | null;
    return clan?.members.find((member) => String(member.userId) === input.userId)?.role ?? 'outsider';
  }

  async getOverview(input: { trackerId: string; userId: string }) {
    const trackerId = objectId(input.trackerId);
    const userId = objectId(input.userId);
    if (!trackerId || !userId) return null;
    const tracker = await Tracker.findOne({ _id: trackerId, deletedAt: null })
      .select('ownerId title description topicsCount subtopicsCount visibility publishedAt createdAt')
      .lean<TrackerLean>();
    if (!tracker) return null;
    const clan = await this.ensureClan(trackerId);
    const role = this.resolveRole(tracker.ownerId, clan, userId);
    const isPublic = tracker.visibility === 'public' || Boolean(tracker.publishedAt);
    if (!isPublic && role === 'outsider') return null;
    if (role === 'outsider') {
      const ownsClone = await Tracker.exists({
        ownerId: userId,
        sourceTrackerId: trackerId,
        deletedAt: null,
      });
      if (!ownsClone) return null;
    }
    return this.toOverview(trackerId, tracker, clan, userId, role);
  }

  async requestJoin(input: { trackerId: string; userId: string }) {
    const trackerId = objectId(input.trackerId);
    const userId = objectId(input.userId);
    if (!trackerId || !userId) return null;
    const tracker = await Tracker.findOne({
      _id: trackerId,
      deletedAt: null,
      $or: [{ visibility: 'public' }, { publishedAt: { $ne: null } }],
    }).lean();
    if (!tracker) return null;
    const clan = await this.ensureClan(trackerId);
    if (String(tracker.ownerId) !== input.userId && !this.member(clan, userId)) {
      const ownsClone = await Tracker.exists({
        ownerId: userId,
        sourceTrackerId: trackerId,
        deletedAt: null,
      });
      if (!ownsClone) return null;
      await TrackerClan.updateOne(
        { trackerId, 'members.userId': { $ne: userId } },
        { $push: { members: { userId, role: 'member', joinedAt: new Date() } } }
      );
      await TrackerClan.updateOne(
        { trackerId },
        {
          $set: {
            'joinRequests.$[request].status': 'approved',
            'joinRequests.$[request].reviewedAt': new Date(),
          },
        },
        { arrayFilters: [{ 'request.userId': userId, 'request.status': 'pending' }] }
      );
    }
    return this.getOverview(input);
  }

  async reviewJoin(input: {
    trackerId: string;
    reviewerId: string;
    requestId: string;
    action: 'approve' | 'reject';
  }) {
    const trackerId = objectId(input.trackerId);
    const reviewerId = objectId(input.reviewerId);
    const requestId = objectId(input.requestId);
    if (!trackerId || !reviewerId || !requestId) return null;
    const tracker = await Tracker.findOne({ _id: trackerId, deletedAt: null }).lean();
    if (!tracker) return null;
    const clan = await this.ensureClan(trackerId);
    if (!this.isManager(tracker.ownerId, clan, reviewerId)) return null;
    const request = clan.joinRequests.find(
      (item) => String(item._id) === input.requestId && item.status === 'pending'
    );
    if (!request) return null;
    const now = new Date();
    await TrackerClan.updateOne(
      { trackerId, 'joinRequests._id': requestId, 'joinRequests.status': 'pending' },
      {
        $set: {
          'joinRequests.$.status': input.action === 'approve' ? 'approved' : 'rejected',
          'joinRequests.$.reviewedAt': now,
          'joinRequests.$.reviewedBy': reviewerId,
        },
        ...(input.action === 'approve' && !this.member(clan, request.userId)
          ? { $push: { members: { userId: request.userId, role: 'member', joinedAt: now } } }
          : {}),
      }
    );
    return this.getOverview({ trackerId: input.trackerId, userId: input.reviewerId });
  }

  async updateMemberRole(input: {
    trackerId: string;
    ownerId: string;
    memberId: string;
    role: 'co_owner' | 'member';
  }) {
    const trackerId = objectId(input.trackerId);
    const ownerId = objectId(input.ownerId);
    const memberId = objectId(input.memberId);
    if (!trackerId || !ownerId || !memberId) return null;
    const tracker = await Tracker.exists({ _id: trackerId, ownerId, deletedAt: null });
    if (!tracker) return null;
    const clan = await this.ensureClan(trackerId);
    const target = this.member(clan, memberId);
    if (!target) return null;
    if (target.role === 'co_owner' && input.role === 'member') {
      const clone = await this.personalClones.cloneTrackerForUser(
        input.trackerId,
        input.memberId,
        { bypassClonePermission: true }
      );
      if (!clone) return null;
    }
    const updated = await TrackerClan.updateOne(
      { trackerId, 'members.userId': memberId },
      { $set: { 'members.$.role': input.role } }
    );
    if (!updated.matchedCount) return null;
    return this.getOverview({ trackerId: input.trackerId, userId: input.ownerId });
  }

  async removeMember(input: { trackerId: string; actorId: string; memberId: string }) {
    const trackerId = objectId(input.trackerId);
    const actorId = objectId(input.actorId);
    const memberId = objectId(input.memberId);
    if (!trackerId || !actorId || !memberId) return null;
    const tracker = await Tracker.findOne({ _id: trackerId, deletedAt: null }).lean();
    if (!tracker) return null;
    const clan = await this.ensureClan(trackerId);
    const actorRole = this.resolveRole(tracker.ownerId, clan, actorId);
    const target = clan.members.find((member) => String(member.userId) === input.memberId);
    const allowed =
      input.actorId === input.memberId ||
      actorRole === 'owner' ||
      (actorRole === 'co_owner' && target?.role === 'member');
    if (!allowed || !target) return null;
    await TrackerClan.updateOne({ trackerId }, { $pull: { members: { userId: memberId } } });
    return this.getOverview({ trackerId: input.trackerId, userId: input.actorId });
  }

  async leaveClan(input: { trackerId: string; userId: string }) {
    const trackerId = objectId(input.trackerId);
    const userId = objectId(input.userId);
    if (!trackerId || !userId) return null;
    const tracker = await Tracker.findOne({ _id: trackerId, deletedAt: null })
      .select('ownerId')
      .lean();
    if (!tracker || String(tracker.ownerId) === input.userId) return null;
    const removed = await TrackerClan.updateOne(
      { trackerId, 'members.userId': userId },
      { $pull: { members: { userId } } }
    );
    if (!removed.modifiedCount) return null;
    return this.getOverview(input);
  }

  async transferOwnership(input: { trackerId: string; ownerId: string; newOwnerId: string }) {
    const trackerId = objectId(input.trackerId);
    const ownerId = objectId(input.ownerId);
    const newOwnerId = objectId(input.newOwnerId);
    if (!trackerId || !ownerId || !newOwnerId) return null;
    const session = await mongoose.startSession();
    let transferred = false;
    try {
      await session.withTransaction(async () => {
        transferred = false;
        const changed = await Tracker.updateOne(
          { _id: trackerId, ownerId, deletedAt: null },
          { $set: { ownerId: newOwnerId } },
          { session }
        );
        if (!changed.modifiedCount) return;
        const clanChanged = await TrackerClan.collection.updateOne(
          { trackerId, 'members.userId': newOwnerId },
          [
            {
              $set: {
                members: {
                  $concatArrays: [
                    {
                      $filter: {
                        input: '$members',
                        as: 'member',
                        cond: {
                          $and: [
                            { $ne: ['$$member.userId', ownerId] },
                            { $ne: ['$$member.userId', newOwnerId] },
                          ],
                        },
                      },
                    },
                    [{ userId: ownerId, role: 'co_owner', joinedAt: new Date() }],
                  ],
                },
              },
            },
          ],
          { session }
        );
        if (!clanChanged.modifiedCount) throw new OwnershipTransferConflict();
        transferred = true;
      });
    } catch (error) {
      if (!(error instanceof OwnershipTransferConflict)) throw error;
    } finally {
      await session.endSession();
    }
    if (!transferred) return null;
    return this.getOverview({ trackerId: input.trackerId, userId: input.ownerId });
  }

  async updateTopic(input: {
    trackerId: string;
    actorId: string;
    topicId: string;
    title: string;
    description: string;
  }) {
    if (!(await this.canManage(input.trackerId, input.actorId))) return false;
    const result = await TrackerTopic.updateOne(
      { _id: objectId(input.topicId), trackerId: objectId(input.trackerId), deletedAt: null },
      { $set: { title: input.title, description: input.description } }
    );
    return result.matchedCount > 0;
  }

  async deleteTopic(input: { trackerId: string; actorId: string; topicId: string }) {
    if (!(await this.canManage(input.trackerId, input.actorId))) return false;
    const trackerId = objectId(input.trackerId);
    const topicId = objectId(input.topicId);
    if (!trackerId || !topicId) return false;
    const now = new Date();
    const topic = await TrackerTopic.findOneAndUpdate(
      { _id: topicId, trackerId, deletedAt: null },
      { $set: { deletedAt: now } },
      { returnDocument: 'after' }
    );
    if (!topic) return false;
    const subtopics = await TrackerSubtopic.countDocuments({ trackerId, topicId, deletedAt: null });
    await Promise.all([
      TrackerSubtopic.updateMany({ trackerId, topicId, deletedAt: null }, { $set: { deletedAt: now } }),
      Tracker.updateOne(
        { _id: trackerId },
        { $inc: { topicsCount: -1, subtopicsCount: -subtopics } }
      ),
    ]);
    return true;
  }

  async deleteSubtopic(input: { trackerId: string; actorId: string; subtopicId: string }) {
    if (!(await this.canManage(input.trackerId, input.actorId))) return false;
    const trackerId = objectId(input.trackerId);
    const subtopicId = objectId(input.subtopicId);
    if (!trackerId || !subtopicId) return false;
    const all = await TrackerSubtopic.find({ trackerId, deletedAt: null })
      .select('_id parentSubtopicId')
      .lean<Array<{ _id: Types.ObjectId; parentSubtopicId?: Types.ObjectId | null }>>();
    if (!all.some((item) => item._id.equals(subtopicId))) return false;
    const ids = new Set([subtopicId.toString()]);
    let added = true;
    while (added) {
      added = false;
      for (const item of all) {
        if (item.parentSubtopicId && ids.has(item.parentSubtopicId.toString()) && !ids.has(item._id.toString())) {
          ids.add(item._id.toString());
          added = true;
        }
      }
    }
    const deletedIds = [...ids].map((id) => new Types.ObjectId(id));
    await Promise.all([
      TrackerSubtopic.updateMany(
        { trackerId, _id: { $in: deletedIds }, deletedAt: null },
        { $set: { deletedAt: new Date() } }
      ),
      Tracker.updateOne({ _id: trackerId }, { $inc: { subtopicsCount: -deletedIds.length } }),
    ]);
    return true;
  }

  async listMessages(input: { trackerId: string; userId: string; limit: number }) {
    const role = await this.getRole({ trackerId: input.trackerId, userId: input.userId });
    if (!role || role === 'outsider') return null;
    const trackerId = objectId(input.trackerId);
    if (!trackerId) return null;
    const chatWindowStart = new Date(
      Date.now() - TRACKER_CLAN_MESSAGE_RETENTION_SECONDS * 1000
    );
    const messages = await TrackerClanMessage.find({
      trackerId,
      deletedAt: null,
      createdAt: { $gte: chatWindowStart },
    })
      .sort({ createdAt: -1 })
      .limit(input.limit)
      .populate('userId', 'fullName username avatarUrl')
      .lean<Array<{
        _id: unknown;
        trackerId: unknown;
        text: string;
        createdAt: Date;
        userId: UserLean | null;
      }>>();
    return messages.reverse().map((message) => {
      const user = message.userId;
      const userId = user ? String(user._id) : '';
      const username = user?.username ?? `user-${userId.slice(-6)}`;
      return {
        id: String(message._id),
        trackerId: String(message.trackerId),
        text: message.text,
        createdAt: message.createdAt,
        user: {
          userId,
          name: user?.fullName?.trim() || username,
          username,
          avatarUrl: user?.avatarUrl ?? null,
        },
      } satisfies TrackerClanMessageRecord;
    });
  }

  async listChallenges(input: { trackerId: string; userId: string }) {
    const role = await this.getRole(input);
    if (!role || role === 'outsider') return null;
    const trackerId = objectId(input.trackerId);
    if (!trackerId) return null;
    const challenges = await TrackerClanChallengeModel.find({ trackerId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean<ChallengeLean[]>();
    const refreshed = await Promise.all(challenges.map((challenge) => this.refreshChallenge(challenge)));
    return this.mapChallenges(refreshed, input.userId);
  }

  async createChallenge(input: {
    trackerId: string;
    challengerId: string;
    opponentId?: string;
    durationMinutes: number;
    questionCount: number;
  }) {
    const role = await this.getRole({ trackerId: input.trackerId, userId: input.challengerId });
    if (!role || role === 'outsider') return null;
    const trackerId = objectId(input.trackerId);
    const challengerId = objectId(input.challengerId);
    const opponentId = input.opponentId ? objectId(input.opponentId) : null;
    if (!trackerId || !challengerId || (input.opponentId && !opponentId)) return null;
    if (opponentId && opponentId.equals(challengerId)) return null;
    if (opponentId) {
      const opponentRole = await this.getRole({
        trackerId: input.trackerId,
        userId: input.opponentId!,
      });
      if (!opponentRole || opponentRole === 'outsider') return null;
    }
    const questions = await this.buildChallengeQuestions(trackerId, input.questionCount);
    if (!questions.length) return null;
    const challenge = await TrackerClanChallengeModel.create({
      trackerId,
      challengerId,
      opponentId,
      challengeType: opponentId ? 'direct' : 'open',
      status: opponentId ? 'pending' : 'open',
      durationMinutes: input.durationMinutes,
      questions,
      acceptBy: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return (await this.mapChallenges([challenge.toObject() as unknown as ChallengeLean], input.challengerId))[0] ?? null;
  }

  async acceptChallenge(input: { trackerId: string; challengeId: string; userId: string }) {
    const role = await this.getRole({ trackerId: input.trackerId, userId: input.userId });
    const trackerId = objectId(input.trackerId);
    const challengeId = objectId(input.challengeId);
    const userId = objectId(input.userId);
    if (!role || role === 'outsider' || !trackerId || !challengeId || !userId) return null;
    const now = new Date();
    const existing = await TrackerClanChallengeModel.findOne({
      _id: challengeId,
      trackerId,
      challengerId: { $ne: userId },
      status: { $in: ['open', 'pending'] },
      acceptBy: { $gt: now },
      $or: [{ challengeType: 'open', opponentId: null }, { challengeType: 'direct', opponentId: userId }],
    }).lean<ChallengeLean>();
    if (!existing) return null;
    const endsAt = new Date(now.getTime() + existing.durationMinutes * 60 * 1000);
    const accepted = await TrackerClanChallengeModel.findOneAndUpdate(
      { _id: challengeId, trackerId, status: existing.status },
      { $set: { opponentId: userId, status: 'active', startsAt: now, endsAt } },
      { returnDocument: 'after' }
    ).lean<ChallengeLean>();
    if (!accepted) return null;
    return (await this.mapChallenges([accepted], input.userId))[0] ?? null;
  }

  async declineChallenge(input: { trackerId: string; challengeId: string; userId: string }) {
    return this.closePendingChallenge(input, 'declined', { opponentId: objectId(input.userId) });
  }

  async cancelChallenge(input: { trackerId: string; challengeId: string; userId: string }) {
    return this.closePendingChallenge(input, 'cancelled', { challengerId: objectId(input.userId) });
  }

  async submitChallenge(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    answers: Array<{ questionId: string; answer: string }>;
  }) {
    const trackerId = objectId(input.trackerId);
    const challengeId = objectId(input.challengeId);
    const userId = objectId(input.userId);
    if (!trackerId || !challengeId || !userId) return null;
    let challenge = await TrackerClanChallengeModel.findOne({
      _id: challengeId,
      trackerId,
      status: 'active',
      $or: [{ challengerId: userId }, { opponentId: userId }],
    })
      .select('+questions.correctAnswer')
      .lean<ChallengeLean>();
    if (!challenge) return null;
    challenge = await this.refreshChallenge(challenge);
    if (challenge.status !== 'active' || !challenge.endsAt || challenge.endsAt <= new Date()) {
      return (await this.mapChallenges([challenge], input.userId))[0] ?? null;
    }
    const isChallenger = String(challenge.challengerId) === input.userId;
    if (isChallenger ? challenge.challengerSubmission : challenge.opponentSubmission) return null;
    const answerMap = new Map(input.answers.map((answer) => [answer.questionId, answer.answer.trim()]));
    const score = challenge.questions.reduce((total, question) => {
      const answer = answerMap.get(String(question._id));
      return answer?.toLocaleLowerCase() === question.correctAnswer?.trim().toLocaleLowerCase()
        ? total + question.points
        : total;
    }, 0);
    const submission = {
      answers: input.answers.map((answer) => ({
        questionId: objectId(answer.questionId),
        answer: answer.answer.trim(),
      })).filter((answer) => answer.questionId),
      score,
      submittedAt: new Date(),
    };
    const submissionField = isChallenger ? 'challengerSubmission' : 'opponentSubmission';
    await TrackerClanChallengeModel.updateOne(
      { _id: challengeId, [submissionField]: null, status: 'active' },
      { $set: { [submissionField]: submission } }
    );
    challenge = await TrackerClanChallengeModel.findById(challengeId)
      .select('+questions.correctAnswer')
      .lean<ChallengeLean>();
    if (!challenge) return null;
    if (challenge.challengerSubmission && challenge.opponentSubmission) {
      challenge = await this.completeChallenge(challenge);
    }
    return (await this.mapChallenges([challenge], input.userId))[0] ?? null;
  }

  private async closePendingChallenge(
    input: { trackerId: string; challengeId: string; userId: string },
    status: 'declined' | 'cancelled',
    actorFilter: { opponentId?: Types.ObjectId | null; challengerId?: Types.ObjectId | null }
  ) {
    const trackerId = objectId(input.trackerId);
    const challengeId = objectId(input.challengeId);
    if (!trackerId || !challengeId || Object.values(actorFilter).some((value) => !value)) return null;
    const challenge = await TrackerClanChallengeModel.findOneAndUpdate(
      { _id: challengeId, trackerId, status: { $in: ['open', 'pending'] }, ...actorFilter },
      { $set: { status, completedAt: new Date() } },
      { returnDocument: 'after' }
    ).lean<ChallengeLean>();
    if (!challenge) return null;
    return (await this.mapChallenges([challenge], input.userId))[0] ?? null;
  }

  private async buildChallengeQuestions(trackerId: Types.ObjectId, count: number) {
    const [topics, subtopics] = await Promise.all([
      TrackerTopic.find({ trackerId, deletedAt: null }).sort({ order: 1 }).select('_id title description').lean(),
      TrackerSubtopic.find({ trackerId, deletedAt: null }).sort({ depth: 1, order: 1 }).select('topicId title description').lean(),
    ]);
    if (!topics.length) return [];
    const topicMap = new Map(topics.map((topic) => [String(topic._id), topic.title]));
    const topicTitles = topics.map((topic) => topic.title);
    const candidates = subtopics
      .map((subtopic) => ({ title: subtopic.title, topicTitle: topicMap.get(String(subtopic.topicId)) }))
      .filter((item): item is { title: string; topicTitle: string } => Boolean(item.topicTitle));
    const source = candidates.length
      ? candidates
      : topics.map((topic) => ({ title: topic.title, topicTitle: topic.title }));
    return Array.from({ length: count }, (_, index) => {
      const item = source[index % source.length]!;
      if (topicTitles.length === 1) {
        const reversed = index % 2 === 1;
        return {
          prompt: reversed
            ? `Is “${item.title}” unrelated to the “${item.topicTitle}” roadmap topic?`
            : `Is “${item.title}” part of the “${item.topicTitle}” roadmap topic?`,
          options: ['Yes', 'No'],
          correctAnswer: reversed ? 'No' : 'Yes',
          topicTitle: item.topicTitle,
          points: 1,
        };
      }
      const distractors = topicTitles.filter((title) => title !== item.topicTitle).slice(0, 3);
      const options = [item.topicTitle, ...distractors].sort((a, b) =>
        `${item.title}:${a}`.localeCompare(`${item.title}:${b}`)
      );
      return {
        prompt: `Which roadmap topic includes “${item.title}”?`,
        options,
        correctAnswer: item.topicTitle,
        topicTitle: item.topicTitle,
        points: 1,
      };
    });
  }

  private async refreshChallenge(challenge: ChallengeLean): Promise<ChallengeLean> {
    const now = new Date();
    if (['open', 'pending'].includes(challenge.status) && challenge.acceptBy <= now) {
      const expired = await TrackerClanChallengeModel.findByIdAndUpdate(
        challenge._id,
        { $set: { status: 'expired', completedAt: now } },
        { returnDocument: 'after' }
      ).lean<ChallengeLean>();
      return expired ?? challenge;
    }
    if (challenge.status === 'active' && challenge.endsAt && challenge.endsAt <= now) {
      return this.completeChallenge(challenge);
    }
    return challenge;
  }

  private async completeChallenge(challenge: ChallengeLean): Promise<ChallengeLean> {
    const challengerScore = challenge.challengerSubmission?.score ?? 0;
    const opponentScore = challenge.opponentSubmission?.score ?? 0;
    const winnerId = challengerScore === opponentScore
      ? null
      : challengerScore > opponentScore
        ? challenge.challengerId
        : challenge.opponentId;
    const completed = await TrackerClanChallengeModel.findOneAndUpdate(
      { _id: challenge._id, status: 'active' },
      { $set: { status: 'completed', winnerId, completedAt: new Date() } },
      { returnDocument: 'after' }
    ).lean<ChallengeLean>();
    return completed ?? { ...challenge, status: 'completed', winnerId, completedAt: new Date() };
  }

  private async mapChallenges(challenges: ChallengeLean[], viewerId: string) {
    const ids = challenges.flatMap((challenge) => [challenge.challengerId, challenge.opponentId]).filter(Boolean);
    const users = await User.find({ _id: { $in: ids }, deletedAt: null })
      .select('_id fullName username avatarUrl')
      .lean<UserLean[]>();
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const person = (id: unknown) => {
      const user = userMap.get(String(id));
      const username = user?.username ?? `user-${String(id).slice(-6)}`;
      return { userId: String(id), name: user?.fullName?.trim() || username, username, avatarUrl: user?.avatarUrl ?? null };
    };
    return challenges.map((challenge) => {
      const isChallenger = String(challenge.challengerId) === viewerId;
      const isOpponent = String(challenge.opponentId ?? '') === viewerId;
      const ownSubmission = isChallenger ? challenge.challengerSubmission : challenge.opponentSubmission;
      const canAccept = ['open', 'pending'].includes(challenge.status) && !isChallenger &&
        (challenge.challengeType === 'open' || isOpponent) && challenge.acceptBy > new Date();
      const canSubmit = challenge.status === 'active' && (isChallenger || isOpponent) && !ownSubmission &&
        Boolean(challenge.endsAt && challenge.endsAt > new Date());
      return {
        id: String(challenge._id),
        trackerId: String(challenge.trackerId),
        challengeType: challenge.challengeType,
        status: challenge.status,
        durationMinutes: challenge.durationMinutes,
        questionCount: challenge.questions.length,
        maxScore: challenge.questions.reduce((total, question) => total + question.points, 0),
        challenger: person(challenge.challengerId),
        opponent: challenge.opponentId ? person(challenge.opponentId) : null,
        challengerScore: challenge.challengerSubmission?.score ?? null,
        opponentScore: challenge.opponentSubmission?.score ?? null,
        winnerId: challenge.winnerId ? String(challenge.winnerId) : null,
        createdAt: challenge.createdAt,
        acceptBy: challenge.acceptBy,
        startsAt: challenge.startsAt ?? null,
        endsAt: challenge.endsAt ?? null,
        completedAt: challenge.completedAt ?? null,
        canAccept,
        canDecline: challenge.status === 'pending' && isOpponent,
        canCancel: ['open', 'pending'].includes(challenge.status) && isChallenger,
        canSubmit,
        submitted: Boolean(ownSubmission),
        questions: challenge.status === 'active' && (isChallenger || isOpponent)
          ? challenge.questions.map((question) => ({
              id: String(question._id), prompt: question.prompt, options: question.options,
              topicTitle: question.topicTitle, points: question.points,
            }))
          : [],
      } satisfies TrackerClanChallenge;
    });
  }

  private async ensureClan(trackerId: Types.ObjectId): Promise<ClanLean> {
    return (await TrackerClan.findOneAndUpdate(
      { trackerId },
      { $setOnInsert: { trackerId, members: [], joinRequests: [] } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean()) as ClanLean;
  }

  private member(clan: ClanLean, userId: unknown) {
    return clan.members.find((item) => String(item.userId) === String(userId));
  }

  private resolveRole(ownerId: unknown, clan: ClanLean, userId: unknown): TrackerClanRole {
    if (String(ownerId) === String(userId)) return 'owner';
    return this.member(clan, userId)?.role ?? 'outsider';
  }

  private isManager(ownerId: unknown, clan: ClanLean, userId: unknown) {
    return ['owner', 'co_owner'].includes(this.resolveRole(ownerId, clan, userId));
  }

  private async canManage(trackerId: string, userId: string) {
    const role = await this.getRole({ trackerId, userId });
    return role === 'owner' || role === 'co_owner';
  }

  private async toOverview(
    trackerId: Types.ObjectId,
    tracker: TrackerLean,
    clan: ClanLean,
    viewerId: Types.ObjectId,
    role: TrackerClanRole
  ): Promise<TrackerClanOverview> {
    const ownerId = tracker.ownerId;
    const ids = [ownerId, ...clan.members.map((member) => member.userId)];
    if (role === 'owner' || role === 'co_owner') {
      ids.push(...clan.joinRequests.map((request) => request.userId));
    }
    const users = (await User.find({ _id: { $in: ids }, deletedAt: null })
      .select('_id fullName username avatarUrl')
      .lean()) as UserLean[];
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const person = (id: unknown) => {
      const user = userMap.get(String(id));
      const username = user?.username || `user-${String(id).slice(-6)}`;
      return {
        userId: String(id),
        name: user?.fullName?.trim() || username,
        username,
        avatarUrl: user?.avatarUrl ?? null,
      };
    };
    const canManage = role === 'owner' || role === 'co_owner';
    return {
      trackerId: String(trackerId),
      trackerTitle: tracker.title,
      trackerDescription: tracker.description ?? '',
      topicsCount: tracker.topicsCount ?? 0,
      subtopicsCount: tracker.subtopicsCount ?? 0,
      visibility: tracker.visibility ?? 'private',
      role,
      canManage,
      canTransferOwnership: role === 'owner',
      hasPendingJoinRequest: clan.joinRequests.some(
        (request) => String(request.userId) === String(viewerId) && request.status === 'pending'
      ),
      members: [
        { ...person(ownerId), role: 'owner' as const, joinedAt: tracker.createdAt },
        ...clan.members.map((member) => ({
          ...person(member.userId),
          role: member.role,
          joinedAt: member.joinedAt,
        })),
      ],
      joinRequests: canManage
        ? clan.joinRequests
            .filter((request) => request.status === 'pending')
            .map((request) => ({
              id: String(request._id),
              ...person(request.userId),
              status: request.status,
              createdAt: request.createdAt,
            }))
        : [],
    };
  }
}

export const mongoTrackerClanRepository = new MongoTrackerClanRepository();
