import mongoose, { Types } from 'mongoose';

import { LessonAnswerAttempt } from '../../../../../infrastructure/database/models/lesson-answer-attempt.model';
import { LessonChatMessage } from '../../../../../infrastructure/database/models/lesson-chat-message.model';
import { LessonCodeSubmission } from '../../../../../infrastructure/database/models/lesson-code-submission.model';
import { LessonGeneratedQuestion } from '../../../../../infrastructure/database/models/lesson-generated-question.model';
import { LessonQuestionSolutionDoubt } from '../../../../../infrastructure/database/models/lesson-question-solution-doubt.model';
import { LessonQuestionSolution } from '../../../../../infrastructure/database/models/lesson-question-solution.model';
import { LessonVisualization } from '../../../../../infrastructure/database/models/lesson-visualization.model';
import { TrackerClan } from '../../../../../infrastructure/database/models/tracker-clan.model';
import { TrackerClanChallenge as TrackerClanChallengeModel } from '../../../../../infrastructure/database/models/tracker-clan-challenge.model';
import {
  TRACKER_CLAN_MESSAGE_RETENTION_SECONDS,
  TrackerClanMessage,
} from '../../../../../infrastructure/database/models/tracker-clan-message.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { TrackerLesson } from '../../../../../infrastructure/database/models/tracker-lesson.model';
import { TrackerProgress } from '../../../../../infrastructure/database/models/tracker-progress.model';
import { TrackerSubtopic } from '../../../../../infrastructure/database/models/tracker-subtopic.model';
import { TrackerTopic } from '../../../../../infrastructure/database/models/tracker-topic.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import { UserSubtopicProgress } from '../../../../../infrastructure/database/models/user-subtopic-progress.model';
import { UserTopicProgress } from '../../../../../infrastructure/database/models/user-topic-progress.model';
import type {
  ITrackerClanRepository,
  ITrackerClanChallengeRepository,
  TrackerClanOverview,
  TrackerClanChallenge,
  TrackerClanChallengeQuestion,
  TrackerClanChallengeQuestionContext,
  TrackerClanRole,
  TrackerClanMessage as TrackerClanMessageRecord,
  ITrackerPersonalCloneProvisioner,
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
  roleInvitations: Array<{
    _id: unknown;
    userId: unknown;
    invitedBy: unknown;
    role: 'co_owner' | 'owner';
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
    respondedAt?: Date | null;
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

type ChallengeProgressLean = {
  position: number;
  questionIndex: number;
  score: number;
  pushBackPowers: number;
  attemptedAnswers: string[];
  attemptedCheckpoints: number[];
  resolvedCheckpoints: number[];
  answerHistory: Array<{
    questionId: unknown;
    answer: string;
    isCorrect: boolean;
    isCheckpoint: boolean;
    positionBefore: number;
    positionAfter: number;
    answeredAt: Date;
  }>;
  lastAnswerCorrect?: boolean | null;
};

type ChallengeLean = {
  _id: unknown;
  trackerId: unknown;
  challengerId: unknown;
  opponentId?: unknown | null;
  challengeType: 'open' | 'direct';
  status: 'open' | 'pending' | 'active' | 'completed' | 'declined' | 'cancelled' | 'expired';
  durationMinutes: number;
  totalNodes?: number;
  questions: Array<{
    _id: unknown;
    prompt: string;
    options: string[];
    correctAnswer?: string;
    topicTitle: string;
    points: number;
    isCheckpoint?: boolean;
  }>;
  challengerSubmission?: ChallengeSubmissionLean | null;
  opponentSubmission?: ChallengeSubmissionLean | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  acceptBy: Date;
  completedAt?: Date | null;
  winnerId?: unknown | null;
  quitById?: unknown | null;
  challengerProgress?: ChallengeProgressLean | null;
  opponentProgress?: ChallengeProgressLean | null;
  createdAt: Date;
};

const objectId = (value: string) =>
  Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;

const publishedTrackerScope = {
  deletedAt: null,
  moderationStatus: { $in: ['active', null] },
  $or: [{ visibility: 'public' }, { publishedAt: { $ne: null } }],
};

export class MongoTrackerClanRepository
  implements ITrackerClanRepository, ITrackerClanChallengeRepository
{
  constructor(
    private readonly personalClones: ITrackerPersonalCloneProvisioner
  ) {}

  async getRole(input: { trackerId: string; userId: string }): Promise<TrackerClanRole | null> {
    const trackerId = objectId(input.trackerId);
    const userId = objectId(input.userId);
    if (!trackerId || !userId) return null;
    const tracker = await Tracker.findOne({ _id: trackerId, ...publishedTrackerScope })
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
    const tracker = await Tracker.findOne({ _id: trackerId, ...publishedTrackerScope })
      .select('ownerId title description topicsCount subtopicsCount visibility publishedAt createdAt')
      .lean<TrackerLean>();
    if (!tracker) return null;
    const clan = await this.ensureClan(trackerId);
    const role = this.resolveRole(tracker.ownerId, clan, userId);
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
    const tracker = await Tracker.findOne({ _id: trackerId, ...publishedTrackerScope }).lean();
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
    const tracker = await Tracker.findOne({ _id: trackerId, ...publishedTrackerScope }).lean();
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
    const tracker = await Tracker.exists({ _id: trackerId, ownerId, ...publishedTrackerScope });
    if (!tracker) return null;
    const clan = await this.ensureClan(trackerId);
    const target = this.member(clan, memberId);
    if (!target) return null;
    if (input.role === 'co_owner') {
      if (target.role === 'co_owner') {
        return this.getOverview({ trackerId: input.trackerId, userId: input.ownerId });
      }
      const alreadyPending = (clan.roleInvitations ?? []).some(
        (invitation) =>
          String(invitation.userId) === input.memberId &&
          invitation.role === 'co_owner' &&
          invitation.status === 'pending'
      );
      if (!alreadyPending) {
        await TrackerClan.updateOne(
          { trackerId },
          {
            $push: {
              roleInvitations: {
                userId: memberId,
                invitedBy: ownerId,
                role: 'co_owner',
                status: 'pending',
                createdAt: new Date(),
              },
            },
          }
        );
      }
      return this.getOverview({ trackerId: input.trackerId, userId: input.ownerId });
    }
    if (target.role === 'co_owner' && input.role === 'member') {
      const cloneReady = await this.personalClones.ensureClone({
        trackerId: input.trackerId,
        userId: input.memberId,
        bypassClonePermission: true,
      });
      if (!cloneReady) return null;
    }
    const updated = await TrackerClan.updateOne(
      { trackerId, 'members.userId': memberId },
      {
        $set: {
          'members.$.role': input.role,
          'roleInvitations.$[invitation].status': 'declined',
          'roleInvitations.$[invitation].respondedAt': new Date(),
        },
      },
      {
        arrayFilters: [
          {
            'invitation.userId': memberId,
            'invitation.status': 'pending',
          },
        ],
      }
    );
    if (!updated.matchedCount) return null;
    return this.getOverview({ trackerId: input.trackerId, userId: input.ownerId });
  }

  async removeMember(input: { trackerId: string; actorId: string; memberId: string }) {
    const trackerId = objectId(input.trackerId);
    const actorId = objectId(input.actorId);
    const memberId = objectId(input.memberId);
    if (!trackerId || !actorId || !memberId) return null;
    const tracker = await Tracker.findOne({ _id: trackerId, ...publishedTrackerScope }).lean();
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
    const tracker = await Tracker.findOne({ _id: trackerId, ...publishedTrackerScope })
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
    const tracker = await Tracker.exists({ _id: trackerId, ownerId, ...publishedTrackerScope });
    if (!tracker) return null;
    const clan = await this.ensureClan(trackerId);
    if (!this.member(clan, newOwnerId)) return null;
    const alreadyPending = (clan.roleInvitations ?? []).some(
      (invitation) =>
        String(invitation.userId) === input.newOwnerId &&
        invitation.role === 'owner' &&
        invitation.status === 'pending'
    );
    if (!alreadyPending) {
      await TrackerClan.updateOne(
        { trackerId },
        {
          $push: {
            roleInvitations: {
              userId: newOwnerId,
              invitedBy: ownerId,
              role: 'owner',
              status: 'pending',
              createdAt: new Date(),
            },
          },
        }
      );
    }
    return this.getOverview({ trackerId: input.trackerId, userId: input.ownerId });
  }

  async respondToRoleInvitation(input: {
    trackerId: string;
    userId: string;
    invitationId: string;
    action: 'accept' | 'decline';
  }) {
    const trackerId = objectId(input.trackerId);
    const userId = objectId(input.userId);
    const invitationId = objectId(input.invitationId);
    if (!trackerId || !userId || !invitationId) return null;
    const tracker = await Tracker.findOne({ _id: trackerId, ...publishedTrackerScope }).lean();
    if (!tracker) return null;
    const clan = await this.ensureClan(trackerId);
    const invitation = (clan.roleInvitations ?? []).find(
      (item) =>
        String(item._id) === input.invitationId &&
        String(item.userId) === input.userId &&
        item.status === 'pending'
    );
    if (!invitation || !this.member(clan, userId)) return null;

    if (input.action === 'decline') {
      await TrackerClan.updateOne(
        { trackerId, 'roleInvitations._id': invitationId },
        {
          $set: {
            'roleInvitations.$.status': 'declined',
            'roleInvitations.$.respondedAt': new Date(),
          },
        }
      );
      return this.getOverview(input);
    }

    if (invitation.role === 'co_owner') {
      const updated = await TrackerClan.updateOne(
        {
          trackerId,
          'members.userId': userId,
          'roleInvitations._id': invitationId,
          'roleInvitations.status': 'pending',
        },
        {
          $set: {
            'members.$[member].role': 'co_owner',
            'roleInvitations.$[invitation].status': 'accepted',
            'roleInvitations.$[invitation].respondedAt': new Date(),
          },
        },
        {
          arrayFilters: [
            { 'member.userId': userId },
            { 'invitation._id': invitationId, 'invitation.status': 'pending' },
          ],
        }
      );
      if (!updated.modifiedCount) return null;
      return this.getOverview(input);
    }

    if (String(tracker.ownerId) !== String(invitation.invitedBy)) return null;
    const previousOwnerId = new Types.ObjectId(String(tracker.ownerId));
    const session = await mongoose.startSession();
    let transferred = false;
    try {
      await session.withTransaction(async () => {
        const ownerChanged = await Tracker.updateOne(
          { _id: trackerId, ownerId: previousOwnerId, deletedAt: null },
          { $set: { ownerId: userId } },
          { session }
        );
        if (!ownerChanged.modifiedCount) return;
        const clanChanged = await TrackerClan.collection.updateOne(
          { trackerId, 'roleInvitations._id': invitationId },
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
                            { $ne: ['$$member.userId', previousOwnerId] },
                            { $ne: ['$$member.userId', userId] },
                          ],
                        },
                      },
                    },
                    [{ userId: previousOwnerId, role: 'co_owner', joinedAt: new Date() }],
                  ],
                },
                roleInvitations: {
                  $map: {
                    input: '$roleInvitations',
                    as: 'invitation',
                    in: {
                      $cond: [
                        { $eq: ['$$invitation._id', invitationId] },
                        {
                          $mergeObjects: [
                            '$$invitation',
                            { status: 'accepted', respondedAt: new Date() },
                          ],
                        },
                        '$$invitation',
                      ],
                    },
                  },
                },
              },
            },
          ],
          { session }
        );
        transferred = clanChanged.modifiedCount > 0;
        if (!transferred) throw new Error('Ownership invitation could not be accepted');
      });
    } finally {
      await session.endSession();
    }
    if (!transferred) return null;
    return this.getOverview(input);
  }

  async syncPersonalClone(input: { trackerId: string; userId: string }) {
    const sourceTrackerId = objectId(input.trackerId);
    const userId = objectId(input.userId);
    if (!sourceTrackerId || !userId) return null;
    const [sourceTracker, clone] = await Promise.all([
      Tracker.findOne({ _id: sourceTrackerId, ...publishedTrackerScope }).lean(),
      Tracker.findOne({ ownerId: userId, sourceTrackerId, deletedAt: null }).lean(),
    ]);
    if (!sourceTracker || !clone) return null;

    const [sourceTopics, cloneTopics] = await Promise.all([
      TrackerTopic.find({ trackerId: sourceTrackerId, deletedAt: null }).sort({ order: 1 }).lean(),
      TrackerTopic.find({ trackerId: clone._id, deletedAt: null }).sort({ order: 1 }).lean(),
    ]);
    const topicMap = new Map(
      cloneTopics
        .filter((topic) => topic.sourceTopicId)
        .map((topic) => [String(topic.sourceTopicId), topic])
    );
    let nextTopicOrder = cloneTopics.reduce((max, topic) => Math.max(max, topic.order), 0) + 1;
    let addedTopics = 0;
    let updatedTopics = 0;
    for (const sourceTopic of sourceTopics) {
      const existing = topicMap.get(String(sourceTopic._id));
      if (existing) {
        await TrackerTopic.updateOne(
          { _id: existing._id },
          {
            $set: {
              title: sourceTopic.title,
              description: sourceTopic.description,
              learningVideo: sourceTopic.learningVideo ?? null,
            },
          }
        );
        updatedTopics += 1;
        continue;
      }
      const created = await TrackerTopic.create({
        trackerId: clone._id,
        sourceTopicId: sourceTopic._id,
        title: sourceTopic.title,
        description: sourceTopic.description,
        order: nextTopicOrder++,
        status: 'locked',
        progressPercent: 0,
        learningVideo: sourceTopic.learningVideo ?? null,
        deletedAt: null,
      });
      topicMap.set(String(sourceTopic._id), created.toObject());
      addedTopics += 1;
    }

    const [sourceSubtopics, cloneSubtopics] = await Promise.all([
      TrackerSubtopic.find({ trackerId: sourceTrackerId, deletedAt: null })
        .sort({ depth: 1, order: 1 })
        .lean(),
      TrackerSubtopic.find({ trackerId: clone._id, deletedAt: null }).lean(),
    ]);
    const subtopicMap = new Map(
      cloneSubtopics
        .filter((subtopic) => subtopic.sourceSubtopicId)
        .map((subtopic) => [String(subtopic.sourceSubtopicId), subtopic])
    );
    let addedSubtopics = 0;
    let updatedSubtopics = 0;
    for (const sourceSubtopic of sourceSubtopics) {
      const mappedTopic = topicMap.get(String(sourceSubtopic.topicId));
      if (!mappedTopic) continue;
      const mappedParent = sourceSubtopic.parentSubtopicId
        ? subtopicMap.get(String(sourceSubtopic.parentSubtopicId))
        : null;
      const existing = subtopicMap.get(String(sourceSubtopic._id));
      if (existing) {
        await TrackerSubtopic.updateOne(
          { _id: existing._id },
          {
            $set: {
              topicId: mappedTopic._id,
              parentSubtopicId: mappedParent?._id ?? null,
              title: sourceSubtopic.title,
              description: sourceSubtopic.description,
              depth: sourceSubtopic.depth,
              learningVideo: sourceSubtopic.learningVideo ?? null,
            },
          }
        );
        updatedSubtopics += 1;
        continue;
      }
      const created = await TrackerSubtopic.create({
        trackerId: clone._id,
        topicId: mappedTopic._id,
        sourceSubtopicId: sourceSubtopic._id,
        parentSubtopicId: mappedParent?._id ?? null,
        title: sourceSubtopic.title,
        description: sourceSubtopic.description,
        order: sourceSubtopic.order,
        depth: sourceSubtopic.depth,
        isLocked: sourceSubtopic.isLocked,
        learningVideo: sourceSubtopic.learningVideo ?? null,
        deletedAt: null,
      });
      subtopicMap.set(String(sourceSubtopic._id), created.toObject());
      addedSubtopics += 1;
    }
    const [topicsCount, subtopicsCount] = await Promise.all([
      TrackerTopic.countDocuments({ trackerId: clone._id, deletedAt: null }),
      TrackerSubtopic.countDocuments({ trackerId: clone._id, deletedAt: null }),
    ]);
    await Tracker.updateOne(
      { _id: clone._id },
      { $set: { topicsCount, subtopicsCount, lastActiveAt: new Date() } }
    );
    return {
      cloneTrackerId: String(clone._id),
      addedTopics,
      updatedTopics,
      addedSubtopics,
      updatedSubtopics,
    };
  }

  async updateTopic(input: {
    trackerId: string;
    actorId: string;
    topicId: string;
    title: string;
    description: string;
  }) {
    if (!(await this.canManage(input.trackerId, input.actorId))) return false;
    const trackerId = objectId(input.trackerId);
    const topicId = objectId(input.topicId);
    if (!trackerId || !topicId) return false;
    const [tracker, topic] = await Promise.all([
      Tracker.findOne({ _id: trackerId, deletedAt: null }).select('sourceTrackerId').lean(),
      TrackerTopic.findOne({ _id: topicId, trackerId, deletedAt: null })
        .select('sourceTopicId')
        .lean(),
    ]);
    if (!tracker || !topic || (tracker.sourceTrackerId && topic.sourceTopicId)) return false;
    const result = await TrackerTopic.updateOne(
      { _id: topicId, trackerId, deletedAt: null },
      { $set: { title: input.title, description: input.description } }
    );
    return result.matchedCount > 0;
  }

  async deleteTopic(input: { trackerId: string; actorId: string; topicId: string }) {
    const trackerId = objectId(input.trackerId);
    const topicId = objectId(input.topicId);
    if (!trackerId || !topicId || !(await this.canManageOriginal(input.trackerId, input.actorId))) {
      return false;
    }
    const session = await mongoose.startSession();
    let deleted = false;
    try {
      await session.withTransaction(async () => {
        const topic = await TrackerTopic.findOne({
          _id: topicId,
          trackerId,
          deletedAt: null,
        }).session(session);
        if (!topic) return;
        const subtopics = await TrackerSubtopic.find({ trackerId, topicId })
          .select('_id')
          .session(session)
          .lean<Array<{ _id: Types.ObjectId }>>();
        const subtopicIds = subtopics.map((subtopic) => subtopic._id);
        await this.deleteSubtopicData(trackerId, subtopicIds, session);
        await UserTopicProgress.deleteMany({ trackerId, topicId }).session(session);
        await TrackerTopic.deleteOne({ _id: topicId, trackerId }).session(session);
        await this.refreshTrackerProgress(trackerId, session);
        deleted = true;
      });
    } finally {
      await session.endSession();
    }
    return deleted;
  }

  async deleteSubtopic(input: { trackerId: string; actorId: string; subtopicId: string }) {
    const trackerId = objectId(input.trackerId);
    const subtopicId = objectId(input.subtopicId);
    if (
      !trackerId ||
      !subtopicId ||
      !(await this.canManageOriginal(input.trackerId, input.actorId))
    ) {
      return false;
    }
    const all = await TrackerSubtopic.find({ trackerId })
      .select('_id parentSubtopicId deletedAt')
      .lean<
        Array<{
          _id: Types.ObjectId;
          parentSubtopicId?: Types.ObjectId | null;
          deletedAt?: Date | null;
        }>
      >();
    const selected = all.find((item) => item._id.equals(subtopicId));
    if (!selected || selected.deletedAt) return false;
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
    const session = await mongoose.startSession();
    let deleted = false;
    try {
      await session.withTransaction(async () => {
        await this.deleteSubtopicData(trackerId, deletedIds, session);
        await this.refreshTrackerProgress(trackerId, session);
        deleted = true;
      });
    } finally {
      await session.endSession();
    }
    return deleted;
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

  async getChallenge(input: { trackerId: string; challengeId: string; userId: string }) {
    const trackerId = objectId(input.trackerId);
    const challengeId = objectId(input.challengeId);
    const userId = objectId(input.userId);
    if (!trackerId || !challengeId || !userId) return null;
    const challenge = await TrackerClanChallengeModel.findOne({
      _id: challengeId,
      trackerId,
      $or: [{ challengerId: userId }, { opponentId: userId }],
    }).lean<ChallengeLean>();
    if (!challenge) return null;
    return (await this.mapChallenges([await this.refreshChallenge(challenge)], input.userId))[0] ?? null;
  }

  async getChallengeHistory(input: { trackerId: string; challengeId: string; userId: string }) {
    const trackerId = objectId(input.trackerId);
    const challengeId = objectId(input.challengeId);
    const userId = objectId(input.userId);
    if (!trackerId || !challengeId || !userId) return null;
    const challenge = await TrackerClanChallengeModel.findOne({
      _id: challengeId,
      trackerId,
      status: 'completed',
      $or: [{ challengerId: userId }, { opponentId: userId }],
    }).select('+questions.correctAnswer').lean<ChallengeLean>();
    if (!challenge?.opponentId || !challenge.completedAt) return null;
    const users = await User.find({
      _id: { $in: [challenge.challengerId, challenge.opponentId] },
      deletedAt: null,
    }).select('_id fullName username avatarUrl').lean<UserLean[]>();
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const questionMap = new Map(challenge.questions.map((question) => [String(question._id), question]));
    const person = (id: unknown) => {
      const user = userMap.get(String(id));
      const username = user?.username ?? `user-${String(id).slice(-6)}`;
      return { userId: String(id), name: user?.fullName?.trim() || username, username, avatarUrl: user?.avatarUrl ?? null };
    };
    const answers = (progress: ChallengeProgressLean) => progress.answerHistory.flatMap((entry) => {
      const question = questionMap.get(String(entry.questionId));
      return question?.correctAnswer ? [{
        questionId: String(entry.questionId),
        prompt: question.prompt,
        options: question.options,
        topicTitle: question.topicTitle,
        answer: entry.answer,
        correctAnswer: question.correctAnswer,
        isCorrect: entry.isCorrect,
        isCheckpoint: entry.isCheckpoint,
        positionBefore: entry.positionBefore,
        positionAfter: entry.positionAfter,
        answeredAt: entry.answeredAt,
      }] : [];
    });
    const challengerProgress = this.progressOf(challenge, true);
    const opponentProgress = this.progressOf(challenge, false);
    return {
      challengeId: String(challenge._id),
      trackerId: String(challenge.trackerId),
      startedAt: challenge.startsAt ?? null,
      completedAt: challenge.completedAt,
      winnerId: challenge.winnerId ? String(challenge.winnerId) : null,
      quitById: challenge.quitById ? String(challenge.quitById) : null,
      players: [
        { user: person(challenge.challengerId), score: challengerProgress.score, answers: answers(challengerProgress) },
        { user: person(challenge.opponentId), score: opponentProgress.score, answers: answers(opponentProgress) },
      ],
    };
  }

  async getActiveChallenge(userId: string) {
    const participantId = objectId(userId);
    if (!participantId) return null;
    const challenge = await TrackerClanChallengeModel.findOne({
      status: 'active',
      endsAt: { $gt: new Date() },
      $or: [{ challengerId: participantId }, { opponentId: participantId }],
    })
      .sort({ startsAt: -1 })
      .lean<ChallengeLean>();
    return challenge ? (await this.mapChallenges([challenge], userId))[0] ?? null : null;
  }

  async canCreateChallenge(input: { challengerId: string; opponentId?: string }) {
    const challengerId = objectId(input.challengerId);
    const opponentId = input.opponentId ? objectId(input.opponentId) : null;
    if (!challengerId || (input.opponentId && !opponentId)) return false;
    const participantIds = [challengerId, opponentId].filter(Boolean);
    const activeChallenge = await TrackerClanChallengeModel.exists({
      status: 'active',
      endsAt: { $gt: new Date() },
      $or: [
        { challengerId: { $in: participantIds } },
        { opponentId: { $in: participantIds } },
      ],
    });
    return !activeChallenge;
  }

  async getChallengeQuestionContext(input: {
    trackerId: string;
    challengerId: string;
    opponentId?: string;
  }): Promise<TrackerClanChallengeQuestionContext | null> {
    const role = await this.getRole({ trackerId: input.trackerId, userId: input.challengerId });
    const trackerId = objectId(input.trackerId);
    const challengerId = objectId(input.challengerId);
    const opponentId = input.opponentId ? objectId(input.opponentId) : null;
    if (!role || role === 'outsider' || !trackerId || !challengerId) return null;
    if (input.opponentId && !opponentId) return null;
    if (opponentId?.equals(challengerId)) return null;
    if (input.opponentId) {
      const opponentRole = await this.getRole({
        trackerId: input.trackerId,
        userId: input.opponentId,
      });
      if (!opponentRole || opponentRole === 'outsider') return null;
    }

    const [tracker, topics, subtopics] = await Promise.all([
      Tracker.findOne({ _id: trackerId, deletedAt: null })
        .select('title description category field goal level contentLanguage')
        .lean<{
          title: string;
          description?: string;
          category?: string;
          field?: string;
          goal?: string;
          level?: 'beginner' | 'intermediate' | 'advanced';
          contentLanguage?: string;
        }>(),
      TrackerTopic.find({ trackerId, deletedAt: null })
        .sort({ order: 1 })
        .select('_id title description')
        .lean<Array<{ _id: Types.ObjectId; title: string; description?: string }>>(),
      TrackerSubtopic.find({ trackerId, deletedAt: null })
        .sort({ depth: 1, order: 1 })
        .select('topicId title description')
        .lean<Array<{
          topicId: Types.ObjectId;
          title: string;
          description?: string;
        }>>(),
    ]);
    if (!tracker || !topics.length) return null;

    const subtopicsByTopic = new Map<string, Array<{ title: string; description: string }>>();
    for (const subtopic of subtopics) {
      const key = String(subtopic.topicId);
      const items = subtopicsByTopic.get(key) ?? [];
      items.push({ title: subtopic.title, description: subtopic.description?.trim() ?? '' });
      subtopicsByTopic.set(key, items);
    }

    return {
      trackerTitle: tracker.title,
      trackerDescription: tracker.description?.trim() ?? '',
      category: tracker.category?.trim() ?? '',
      field: tracker.field?.trim() ?? '',
      goal: tracker.goal?.trim() ?? '',
      level: tracker.level ?? 'beginner',
      contentLanguage: tracker.contentLanguage?.trim() || 'English',
      topics: topics.map((topic) => ({
        title: topic.title,
        description: topic.description?.trim() ?? '',
        subtopics: subtopicsByTopic.get(String(topic._id)) ?? [],
      })),
    };
  }

  async createChallenge(input: {
    trackerId: string;
    challengerId: string;
    opponentId?: string;
    durationMinutes: number;
    questionCount: number;
    questions: TrackerClanChallengeQuestion[];
  }) {
    const role = await this.getRole({ trackerId: input.trackerId, userId: input.challengerId });
    if (!role || role === 'outsider') return null;
    const trackerId = objectId(input.trackerId);
    const challengerId = objectId(input.challengerId);
    const opponentId = input.opponentId ? objectId(input.opponentId) : null;
    if (!trackerId || !challengerId || (input.opponentId && !opponentId)) return null;
    if (opponentId && opponentId.equals(challengerId)) return null;
    if (
      input.questions.length < input.questionCount ||
      input.questions.some(
        (question) =>
          question.options.length < 2 || !question.options.includes(question.correctAnswer)
      )
    ) {
      return null;
    }
    if (opponentId) {
      const opponentRole = await this.getRole({
        trackerId: input.trackerId,
        userId: input.opponentId!,
      });
      if (!opponentRole || opponentRole === 'outsider') return null;
    }
    const participants = [challengerId, opponentId].filter(Boolean);
    const activeChallenge = await TrackerClanChallengeModel.exists({
      status: 'active',
      endsAt: { $gt: new Date() },
      $or: [{ challengerId: { $in: participants } }, { opponentId: { $in: participants } }],
    });
    if (activeChallenge) return null;
    const challenge = await TrackerClanChallengeModel.create({
      trackerId,
      challengerId,
      opponentId,
      participantIds: [challengerId, opponentId].filter(Boolean),
      challengeType: opponentId ? 'direct' : 'open',
      status: opponentId ? 'pending' : 'open',
      durationMinutes: input.durationMinutes,
      totalNodes: input.questionCount,
      questions: input.questions,
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
    const participantIds = [existing.challengerId, userId];
    const activeChallenge = await TrackerClanChallengeModel.exists({
      _id: { $ne: challengeId },
      status: 'active',
      endsAt: { $gt: now },
      $or: [
        { challengerId: { $in: participantIds } },
        { opponentId: { $in: participantIds } },
      ],
    });
    if (activeChallenge) return null;
    const endsAt = new Date(now.getTime() + existing.durationMinutes * 60 * 1000);
    const accepted = await TrackerClanChallengeModel.findOneAndUpdate(
      { _id: challengeId, trackerId, status: existing.status },
      {
        $set: {
          opponentId: userId,
          participantIds: [existing.challengerId, userId],
          status: 'active',
          startsAt: now,
          endsAt,
          challengerProgress: {
            position: 0, questionIndex: 0, score: 0, pushBackPowers: 0, attemptedAnswers: [],
            attemptedCheckpoints: [], resolvedCheckpoints: [], answerHistory: [], lastAnswerCorrect: null,
          },
          opponentProgress: {
            position: 0, questionIndex: 0, score: 0, pushBackPowers: 0, attemptedAnswers: [],
            attemptedCheckpoints: [], resolvedCheckpoints: [], answerHistory: [], lastAnswerCorrect: null,
          },
        },
      },
      { returnDocument: 'after' }
    )
      .lean<ChallengeLean>()
      .catch((error: unknown) => {
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) return null;
        throw error;
      });
    if (!accepted) return null;
    await TrackerClanChallengeModel.updateMany(
      {
        _id: { $ne: challengeId },
        challengerId: userId,
        status: { $in: ['open', 'pending'] },
      },
      { $set: { status: 'cancelled', completedAt: now } }
    );
    return (await this.mapChallenges([accepted], input.userId))[0] ?? null;
  }

  async chooseChallengeCheckpoint(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    decision: 'attempt' | 'skip';
  }) {
    const challenge = await this.findActiveParticipantChallenge(input);
    if (!challenge) return null;
    const isChallenger = String(challenge.challengerId) === input.userId;
    const progressField = isChallenger ? 'challengerProgress' : 'opponentProgress';
    const progress = this.progressOf(challenge, isChallenger);
    const node = progress.position + 1;
    const totalNodes = this.totalNodesOf(challenge);
    if (!this.isCheckpointNode(node, totalNodes) || progress.resolvedCheckpoints.includes(node) || progress.attemptedCheckpoints.includes(node)) return null;

    const update: Record<string, unknown> = input.decision === 'attempt'
      ? { $addToSet: { [`${progressField}.attemptedCheckpoints`]: node } }
      : {
          $set: {
            [`${progressField}.position`]: node,
            [`${progressField}.attemptedAnswers`]: [],
            [`${progressField}.lastAnswerCorrect`]: null,
            ...(node >= totalNodes
              ? { status: 'completed', winnerId: objectId(input.userId), completedAt: new Date() }
              : {}),
          },
          $addToSet: { [`${progressField}.resolvedCheckpoints`]: node },
        };
    const updated = await TrackerClanChallengeModel.findOneAndUpdate(
      {
        _id: challenge._id,
        status: 'active',
        [`${progressField}.position`]: progress.position,
        $or: [
          { [`${progressField}.questionIndex`]: progress.questionIndex },
          { [`${progressField}.questionIndex`]: { $exists: false } },
        ],
      },
      update,
      { returnDocument: 'after' }
    ).lean<ChallengeLean>();
    return updated ? (await this.mapChallenges([updated], input.userId))[0] ?? null : null;
  }

  async answerChallengeNode(input: { trackerId: string; challengeId: string; userId: string; questionId: string; answer: string }) {
    const challenge = await this.findActiveParticipantChallenge(input);
    if (!challenge) return null;
    const isChallenger = String(challenge.challengerId) === input.userId;
    const progressField = isChallenger ? 'challengerProgress' : 'opponentProgress';
    const progress = this.progressOf(challenge, isChallenger);
    const node = progress.position + 1;
    const totalNodes = this.totalNodesOf(challenge);
    const question = challenge.questions[progress.questionIndex];
    const answer = input.answer.trim();
    if (!question || String(question._id) !== input.questionId || !answer) return null;
    const isCheckpoint = this.isCheckpointNode(node, totalNodes) && !progress.resolvedCheckpoints.includes(node);
    if (isCheckpoint && !progress.attemptedCheckpoints.includes(node)) return null;
    const correct = answer.toLocaleLowerCase() === question.correctAnswer?.trim().toLocaleLowerCase();
    const finished = correct && node >= totalNodes;
    const nextPosition = correct
      ? Math.min(totalNodes, node)
      : Math.max(0, progress.position - (isCheckpoint ? 3 : 1));
    const historyEntry = {
      questionId: question._id,
      answer,
      isCorrect: correct,
      isCheckpoint,
      positionBefore: progress.position,
      positionAfter: nextPosition,
      answeredAt: new Date(),
    };
    const update = correct
      ? {
          $set: {
            [`${progressField}.position`]: nextPosition,
            [`${progressField}.questionIndex`]: progress.questionIndex + 1,
            [`${progressField}.attemptedAnswers`]: [],
            [`${progressField}.lastAnswerCorrect`]: true,
            ...(finished ? { status: 'completed', winnerId: objectId(input.userId), completedAt: new Date() } : {}),
          },
          $inc: {
            [`${progressField}.score`]: 1,
            ...(isCheckpoint ? { [`${progressField}.pushBackPowers`]: 1 } : {}),
          },
          ...(isCheckpoint ? { $addToSet: { [`${progressField}.resolvedCheckpoints`]: node } } : {}),
          $push: { [`${progressField}.answerHistory`]: historyEntry },
        }
      : {
          $set: {
            [`${progressField}.position`]: nextPosition,
            [`${progressField}.questionIndex`]: progress.questionIndex + 1,
            [`${progressField}.attemptedAnswers`]: [],
            [`${progressField}.lastAnswerCorrect`]: false,
          },
          ...(isCheckpoint ? { $addToSet: { [`${progressField}.resolvedCheckpoints`]: node } } : {}),
          $push: { [`${progressField}.answerHistory`]: historyEntry },
        };
    const updated = await TrackerClanChallengeModel.findOneAndUpdate(
      {
        _id: challenge._id,
        status: 'active',
        [`${progressField}.position`]: progress.position,
        $or: [
          { [`${progressField}.questionIndex`]: progress.questionIndex },
          { [`${progressField}.questionIndex`]: { $exists: false } },
        ],
      },
      update,
      { returnDocument: 'after' }
    ).lean<ChallengeLean>();
    return updated ? (await this.mapChallenges([updated], input.userId))[0] ?? null : null;
  }

  async useChallengePower(input: { trackerId: string; challengeId: string; userId: string }) {
    const challenge = await this.findActiveParticipantChallenge(input);
    if (!challenge) return null;
    const isChallenger = String(challenge.challengerId) === input.userId;
    const ownField = isChallenger ? 'challengerProgress' : 'opponentProgress';
    const opponentField = isChallenger ? 'opponentProgress' : 'challengerProgress';
    const own = this.progressOf(challenge, isChallenger);
    const opponent = this.progressOf(challenge, !isChallenger);
    if (own.pushBackPowers < 1) return null;
    const updated = await TrackerClanChallengeModel.findOneAndUpdate(
      {
        _id: challenge._id,
        status: 'active',
        [`${ownField}.pushBackPowers`]: { $gte: 1 },
        [`${opponentField}.position`]: opponent.position,
      },
      {
        $inc: { [`${ownField}.pushBackPowers`]: -1 },
        $set: {
          [`${opponentField}.position`]: Math.max(0, opponent.position - 2),
          [`${opponentField}.attemptedAnswers`]: [],
          [`${opponentField}.lastAnswerCorrect`]: null,
        },
      },
      { returnDocument: 'after' }
    ).lean<ChallengeLean>();
    return updated ? (await this.mapChallenges([updated], input.userId))[0] ?? null : null;
  }

  private async findActiveParticipantChallenge(input: { trackerId: string; challengeId: string; userId: string }) {
    const trackerId = objectId(input.trackerId);
    const challengeId = objectId(input.challengeId);
    const userId = objectId(input.userId);
    if (!trackerId || !challengeId || !userId) return null;
    const challenge = await TrackerClanChallengeModel.findOne({
      _id: challengeId,
      trackerId,
      status: 'active',
      endsAt: { $gt: new Date() },
      $or: [{ challengerId: userId }, { opponentId: userId }],
    }).select('+questions.correctAnswer').lean<ChallengeLean>();
    return challenge ? this.refreshChallenge(challenge) : null;
  }

  private progressOf(challenge: ChallengeLean, challenger: boolean): ChallengeProgressLean {
    const progress = challenger ? challenge.challengerProgress : challenge.opponentProgress;
    if (progress) {
      return {
        ...progress,
        questionIndex: progress.questionIndex ?? progress.position,
        answerHistory: progress.answerHistory ?? [],
      };
    }
    return {
      position: 0,
      questionIndex: 0,
      score: 0,
      pushBackPowers: 0,
      attemptedAnswers: [],
      attemptedCheckpoints: [],
      resolvedCheckpoints: [],
      answerHistory: [],
      lastAnswerCorrect: null,
    };
  }

  private totalNodesOf(challenge: ChallengeLean) {
    return challenge.totalNodes ?? Math.min(15, challenge.questions.length);
  }

  private isCheckpointNode(node: number, totalNodes: number) {
    return node > 0 && node <= totalNodes && node % 5 === 0;
  }

  async declineChallenge(input: { trackerId: string; challengeId: string; userId: string }) {
    return this.closePendingChallenge(input, 'declined', { opponentId: objectId(input.userId) });
  }

  async cancelChallenge(input: { trackerId: string; challengeId: string; userId: string }) {
    return this.closePendingChallenge(input, 'cancelled', { challengerId: objectId(input.userId) });
  }

  async quitChallenge(input: { trackerId: string; challengeId: string; userId: string }) {
    const challenge = await this.findActiveParticipantChallenge(input);
    if (!challenge) return null;
    const winnerId = String(challenge.challengerId) === input.userId
      ? challenge.opponentId
      : challenge.challengerId;
    const quitById = objectId(input.userId);
    if (!winnerId || !quitById) return null;
    const completed = await TrackerClanChallengeModel.findOneAndUpdate(
      { _id: challenge._id, status: 'active' },
      {
        $set: {
          status: 'completed',
          winnerId,
          quitById,
          completedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    ).lean<ChallengeLean>();
    return completed ? (await this.mapChallenges([completed], input.userId))[0] ?? null : null;
  }

  async getChallengeExtensionContext(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }) {
    const challenge = await this.findActiveParticipantChallenge(input);
    if (!challenge) return null;
    const progress = this.progressOf(
      challenge,
      String(challenge.challengerId) === input.userId
    );
    if (challenge.questions.length - progress.questionIndex > 5) return null;
    const context = await this.getChallengeQuestionContext({
      trackerId: input.trackerId,
      challengerId: input.userId,
    });
    return context
      ? { context, existingQuestionCount: challenge.questions.length }
      : null;
  }

  async appendChallengeQuestions(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    expectedQuestionCount: number;
    questions: TrackerClanChallengeQuestion[];
  }) {
    const trackerId = objectId(input.trackerId);
    const challengeId = objectId(input.challengeId);
    const userId = objectId(input.userId);
    if (
      !trackerId ||
      !challengeId ||
      !userId ||
      input.questions.length < 1 ||
      input.questions.some(
        (question) => question.options.length < 2 || !question.options.includes(question.correctAnswer)
      )
    ) return null;
    const participantFilter = { $or: [{ challengerId: userId }, { opponentId: userId }] };
    const updated = await TrackerClanChallengeModel.findOneAndUpdate(
      {
        _id: challengeId,
        trackerId,
        status: 'active',
        endsAt: { $gt: new Date() },
        $expr: { $eq: [{ $size: '$questions' }, input.expectedQuestionCount] },
        ...participantFilter,
      },
      { $push: { questions: { $each: input.questions } } },
      { returnDocument: 'after' }
    ).lean<ChallengeLean>();
    const challenge = updated ?? await TrackerClanChallengeModel.findOne({
      _id: challengeId,
      trackerId,
      status: 'active',
      ...participantFilter,
    }).lean<ChallengeLean>();
    return challenge ? (await this.mapChallenges([challenge], input.userId))[0] ?? null : null;
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
    const usesLegacySubmissions = Boolean(challenge.challengerSubmission || challenge.opponentSubmission);
    const challengerScore = usesLegacySubmissions
      ? challenge.challengerSubmission?.score ?? 0
      : challenge.challengerProgress?.position ?? 0;
    const opponentScore = usesLegacySubmissions
      ? challenge.opponentSubmission?.score ?? 0
      : challenge.opponentProgress?.position ?? 0;
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
      const viewerProgress = this.progressOf(challenge, isChallenger);
      const opponentProgress = this.progressOf(challenge, !isChallenger);
      const totalNodes = this.totalNodesOf(challenge);
      const currentQuestion = challenge.questions[viewerProgress.questionIndex];
      const currentNode = viewerProgress.position + 1;
      const checkpointNodes = Array.from(
        { length: Math.floor(totalNodes / 5) },
        (_, index) => (index + 1) * 5
      );
      const isCheckpoint = checkpointNodes.includes(currentNode) &&
        !viewerProgress.resolvedCheckpoints.includes(currentNode);
      const checkpointDecisionRequired = Boolean(
        challenge.status === 'active' &&
        isCheckpoint &&
        !viewerProgress.attemptedCheckpoints.includes(currentNode) &&
        currentQuestion
      );
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
        questionCount: totalNodes,
        maxScore: totalNodes,
        challenger: person(challenge.challengerId),
        opponent: challenge.opponentId ? person(challenge.opponentId) : null,
        challengerScore: challenge.challengerSubmission?.score ?? challenge.challengerProgress?.score ?? null,
        opponentScore: challenge.opponentSubmission?.score ?? challenge.opponentProgress?.score ?? null,
        winnerId: challenge.winnerId ? String(challenge.winnerId) : null,
        quitById: challenge.quitById ? String(challenge.quitById) : null,
        createdAt: challenge.createdAt,
        acceptBy: challenge.acceptBy,
        startsAt: challenge.startsAt ?? null,
        endsAt: challenge.endsAt ?? null,
        completedAt: challenge.completedAt ?? null,
        canAccept,
        canDecline: challenge.status === 'pending' && isOpponent,
        canCancel: ['open', 'pending'].includes(challenge.status) && isChallenger,
        canQuit: challenge.status === 'active' && (isChallenger || isOpponent),
        canSubmit,
        submitted: Boolean(ownSubmission),
        totalNodes,
        checkpointNodes,
        viewerPosition: viewerProgress.position,
        opponentPosition: opponentProgress.position,
        viewerScore: viewerProgress.score,
        opponentLiveScore: opponentProgress.score,
        questionsRemaining: Math.max(0, challenge.questions.length - viewerProgress.questionIndex),
        pushBackPowers: viewerProgress.pushBackPowers,
        checkpointDecisionRequired,
        lastAnswerCorrect: viewerProgress.lastAnswerCorrect ?? null,
        questions: challenge.status === 'active' && (isChallenger || isOpponent) && currentQuestion && !checkpointDecisionRequired
          ? [{
              id: String(currentQuestion._id), prompt: currentQuestion.prompt, options: currentQuestion.options,
              topicTitle: currentQuestion.topicTitle, points: currentQuestion.points, isCheckpoint,
            }]
          : [],
      } satisfies TrackerClanChallenge;
    });
  }

  private async ensureClan(trackerId: Types.ObjectId): Promise<ClanLean> {
    const isPublished = await Tracker.exists({ _id: trackerId, ...publishedTrackerScope });
    if (!isPublished) {
      throw new Error('Clan data cannot be created for an unpublished tracker');
    }
    const clan = (await TrackerClan.findOneAndUpdate(
      { trackerId },
      { $setOnInsert: { trackerId, members: [], joinRequests: [], roleInvitations: [] } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean()) as ClanLean;
    if (!Array.isArray(clan.roleInvitations)) {
      await TrackerClan.updateOne({ trackerId }, { $set: { roleInvitations: [] } });
      clan.roleInvitations = [];
    }
    return clan;
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

  private async canManageOriginal(trackerId: string, userId: string) {
    const trackerObjectId = objectId(trackerId);
    const userObjectId = objectId(userId);
    if (!trackerObjectId || !userObjectId) return false;
    const tracker = await Tracker.findOne({
      _id: trackerObjectId,
      sourceTrackerId: null,
      deletedAt: null,
      moderationStatus: { $in: ['active', null] },
    })
      .select('ownerId visibility publishedAt')
      .lean<{ ownerId: unknown; visibility?: string; publishedAt?: Date | null }>();
    if (!tracker) return false;
    if (String(tracker.ownerId) === userId) return true;
    if (tracker.visibility !== 'public' && !tracker.publishedAt) return false;
    const clan = (await TrackerClan.findOne({ trackerId: trackerObjectId }).lean()) as ClanLean | null;
    return Boolean(clan && this.isManager(tracker.ownerId, clan, userObjectId));
  }

  private async deleteSubtopicData(
    trackerId: Types.ObjectId,
    subtopicIds: Types.ObjectId[],
    session: mongoose.ClientSession
  ) {
    if (!subtopicIds.length) return;
    const subtopicFilter = { trackerId, subtopicId: { $in: subtopicIds } };
    await LessonAnswerAttempt.deleteMany(subtopicFilter).session(session);
    await LessonChatMessage.deleteMany(subtopicFilter).session(session);
    await LessonCodeSubmission.deleteMany(subtopicFilter).session(session);
    await LessonGeneratedQuestion.deleteMany(subtopicFilter).session(session);
    await LessonQuestionSolution.deleteMany(subtopicFilter).session(session);
    await LessonQuestionSolutionDoubt.deleteMany(subtopicFilter).session(session);
    await LessonVisualization.deleteMany(subtopicFilter).session(session);
    await TrackerLesson.deleteMany(subtopicFilter).session(session);
    await UserSubtopicProgress.deleteMany({
      trackerId,
      subtopicId: { $in: subtopicIds },
    }).session(session);
    await TrackerSubtopic.deleteMany({ trackerId, _id: { $in: subtopicIds } }).session(session);
  }

  private async refreshTrackerProgress(
    trackerId: Types.ObjectId,
    session: mongoose.ClientSession
  ) {
    const tracker = await Tracker.findById(trackerId)
      .select('ownerId')
      .session(session)
      .lean<{ ownerId: unknown }>();
    const totalTopics = await TrackerTopic.countDocuments({ trackerId, deletedAt: null }).session(
      session
    );
    const totalSubtopics = await TrackerSubtopic.countDocuments({
      trackerId,
      deletedAt: null,
    }).session(session);
    const progressRows = await TrackerProgress.find({ trackerId })
      .select('userId')
      .session(session)
      .lean();
    for (const progress of progressRows) {
      const completedTopics = await UserTopicProgress.countDocuments({
        userId: progress.userId,
        trackerId,
        status: 'completed',
      }).session(session);
      const completedSubtopics = await UserSubtopicProgress.countDocuments({
        userId: progress.userId,
        trackerId,
        status: 'completed',
      }).session(session);
      const completionPercentage = totalSubtopics
        ? Math.min(100, Math.round((completedSubtopics / totalSubtopics) * 100))
        : 0;
      await TrackerProgress.updateOne(
        { _id: progress._id },
        {
          $set: {
            totalTopics,
            totalSubtopics,
            completedTopics,
            completedSubtopics,
            completionPercentage,
            completedAt: completionPercentage === 100 ? new Date() : null,
          },
        },
        { session }
      );
    }
    const ownerProgress = tracker
      ? progressRows.find((progress) => String(progress.userId) === String(tracker.ownerId))
      : null;
    const ownerCompletedSubtopics = ownerProgress
      ? await UserSubtopicProgress.countDocuments({
          userId: ownerProgress.userId,
          trackerId,
          status: 'completed',
        }).session(session)
      : 0;
    await Tracker.updateOne(
      { _id: trackerId },
      {
        $set: {
          topicsCount: totalTopics,
          subtopicsCount: totalSubtopics,
          completedSubtopicsCount: ownerCompletedSubtopics,
          progressPercent: totalSubtopics
            ? Math.min(100, Math.round((ownerCompletedSubtopics / totalSubtopics) * 100))
            : 0,
          lastActiveAt: new Date(),
        },
      },
      { session }
    );
  }

  private async canManage(trackerId: string, userId: string) {
    const trackerObjectId = objectId(trackerId);
    const userObjectId = objectId(userId);
    if (!trackerObjectId || !userObjectId) return false;
    const tracker = await Tracker.findOne({
      _id: trackerObjectId,
      deletedAt: null,
      moderationStatus: { $in: ['active', null] },
    })
      .select('ownerId visibility publishedAt')
      .lean<{ ownerId: unknown; visibility?: string; publishedAt?: Date | null }>();
    if (!tracker) return false;
    if (String(tracker.ownerId) === userId) return true;
    if (tracker.visibility !== 'public' && !tracker.publishedAt) return false;
    const clan = (await TrackerClan.findOne({ trackerId: trackerObjectId }).lean()) as ClanLean | null;
    return Boolean(clan && this.isManager(tracker.ownerId, clan, userObjectId));
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
    const [users, personalClone] = await Promise.all([
      User.find({ _id: { $in: ids }, deletedAt: null })
        .select('_id fullName username avatarUrl')
        .lean() as unknown as Promise<UserLean[]>,
      Tracker.findOne({
        ownerId: viewerId,
        sourceTrackerId: trackerId,
        deletedAt: null,
      })
        .select('_id')
        .lean<{ _id: unknown }>(),
    ]);
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
      personalCloneTrackerId: personalClone ? String(personalClone._id) : null,
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
      roleInvitations: (clan.roleInvitations ?? [])
        .filter(
          (invitation) =>
            invitation.status === 'pending' &&
            (role === 'owner' || String(invitation.userId) === String(viewerId))
        )
        .map((invitation) => ({
          id: String(invitation._id),
          userId: String(invitation.userId),
          role: invitation.role,
          status: invitation.status,
          createdAt: invitation.createdAt,
          invitedBy: person(invitation.invitedBy),
        })),
    };
  }
}
