import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { TrackerSubtopic } from '../../src/infrastructure/database/models/tracker-subtopic.model';
import { TrackerTopic } from '../../src/infrastructure/database/models/tracker-topic.model';
import { TrackerTopicContribution } from '../../src/infrastructure/database/models/tracker-topic-contribution.model';
import { TrackerClanMessage } from '../../src/infrastructure/database/models/tracker-clan-message.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import { MongoTrackerTopicContributionRepository } from '../../src/modules/user/trackers/infrastructure/repositories/mongo-tracker-topic-contribution.repository';
import { MongoTrackerManagementRepository } from '../../src/modules/user/trackers/infrastructure/repositories/internal/mongo-tracker-management.repository';
import { MongoTrackerProgressRepository } from '../../src/modules/user/trackers/infrastructure/repositories/internal/mongo-tracker-progress.repository';
import { PublishTrackerUseCase } from '../../src/modules/user/trackers/application/use-cases/publish-tracker.usecase';
import { TrackerMapper } from '../../src/modules/user/trackers/application/tracker.mapper';
import { MongoTrackerClanRepository } from '../../src/modules/user/trackers/infrastructure/repositories/mongo-tracker-clan.repository';

describe('tracker topic contributions', () => {
  let mongo: MongoMemoryReplSet;

  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(mongo.getUri());
    await TrackerTopicContribution.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('snapshots a cloned topic and merges its nested subtopics after owner approval', async () => {
    const [owner, contributor] = await User.create([
      {
        fullName: 'Original Author',
        username: 'original-author',
        passwordHash: null,
        emailVerified: true,
      },
      {
        fullName: 'Helpful Learner',
        username: 'helpful-learner',
        passwordHash: null,
        emailVerified: true,
      },
    ]);
    const source = await Tracker.create({
      ownerId: owner._id,
      title: 'JEE Mathematics',
      slug: 'jee-mathematics-source',
      visibility: 'public',
      status: 'active',
      publishedAt: new Date(),
      topicsCount: 1,
      subtopicsCount: 0,
    });
    const clone = await Tracker.create({
      ownerId: contributor._id,
      title: source.title,
      slug: 'jee-mathematics-clone',
      sourceTrackerId: source._id,
      visibility: 'private',
      status: 'active',
    });
    const sourceTopic = await TrackerTopic.create({
      trackerId: source._id,
      title: 'Number Theory',
      description: 'Core divisibility concepts',
      order: 1,
      status: 'active',
    });
    const copiedTopic = await TrackerTopic.create({
      trackerId: clone._id,
      sourceTopicId: sourceTopic._id,
      title: sourceTopic.title,
      description: sourceTopic.description,
      order: 1,
      status: 'active',
    });
    const legacyCopiedTopic = await TrackerTopic.create({
      trackerId: clone._id,
      title: sourceTopic.title,
      description: sourceTopic.description,
      order: 2,
      status: 'locked',
    });
    const cloneTopic = await TrackerTopic.create({
      trackerId: clone._id,
      title: 'Combinatorics',
      description: 'Counting principles and arrangements',
      order: 3,
      status: 'locked',
    });
    const parent = await TrackerSubtopic.create({
      trackerId: clone._id,
      topicId: cloneTopic._id,
      title: 'Permutations',
      description: 'Ordering distinct objects',
      order: 1,
      depth: 1,
      isLocked: false,
    });
    await TrackerSubtopic.create({
      trackerId: clone._id,
      topicId: cloneTopic._id,
      parentSubtopicId: parent._id,
      title: 'Circular permutations',
      description: 'Arrangements around a circle',
      order: 1,
      depth: 2,
      isLocked: true,
    });

    const managementRepository = new MongoTrackerManagementRepository();
    const listed = await managementRepository.listOwnedTrackers({
      userId: contributor._id.toString(),
      status: 'all',
      domain: 'all',
      sortBy: 'createdAt',
      page: 1,
      limit: 10,
    });
    expect(listed.trackers[0]).toMatchObject({
      sourceTrackerId: source._id.toString(),
      clonedFrom: {
        trackerId: source._id.toString(),
        ownerId: owner._id.toString(),
        name: 'Original Author',
        username: 'original-author',
      },
    });
    const publishUseCase = new PublishTrackerUseCase(managementRepository, new TrackerMapper());
    await expect(
      publishUseCase.execute({
        trackerId: clone._id.toString(),
        userId: contributor._id.toString(),
      })
    ).rejects.toMatchObject({ code: 'CLONED_TRACKER_CANNOT_BE_PUBLISHED', kind: 'conflict' });

    const repository = new MongoTrackerTopicContributionRepository();
    const classifiedTopics = await new MongoTrackerProgressRepository().getTopicsWithUserProgress({
      trackerId: clone._id.toString(),
      userId: contributor._id.toString(),
    });
    expect(classifiedTopics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _id: copiedTopic._id.toString(), isCloneAddition: false }),
        expect.objectContaining({ _id: legacyCopiedTopic._id.toString(), isCloneAddition: false }),
        expect.objectContaining({ _id: cloneTopic._id.toString(), isCloneAddition: true }),
      ])
    );

    await expect(
      repository.create({
        cloneTrackerId: clone._id.toString(),
        cloneTopicId: copiedTopic._id.toString(),
        requesterId: contributor._id.toString(),
      })
    ).resolves.toEqual({ ok: false, reason: 'not-a-change' });
    await expect(
      repository.create({
        cloneTrackerId: clone._id.toString(),
        cloneTopicId: legacyCopiedTopic._id.toString(),
        requesterId: contributor._id.toString(),
      })
    ).resolves.toEqual({ ok: false, reason: 'not-a-change' });

    const created = await repository.create({
      cloneTrackerId: clone._id.toString(),
      cloneTopicId: cloneTopic._id.toString(),
      requesterId: contributor._id.toString(),
    });

    expect(created).toMatchObject({
      ok: true,
      contribution: { title: 'Combinatorics', subtopicsCount: 2, status: 'pending' },
    });
    if (!created.ok) throw new Error('Expected contribution creation to succeed');

    const ownerTrackerList = await managementRepository.listOwnedTrackers({
      userId: owner._id.toString(),
      status: 'all',
      domain: 'all',
      sortBy: 'createdAt',
      page: 1,
      limit: 10,
    });
    expect(ownerTrackerList.trackers[0]).toMatchObject({
      clanRole: 'owner',
      clanNotificationsCount: 1,
    });

    await expect(
      repository.create({
        cloneTrackerId: clone._id.toString(),
        cloneTopicId: cloneTopic._id.toString(),
        requesterId: contributor._id.toString(),
      })
    ).resolves.toEqual({ ok: false, reason: 'duplicate' });

    const contributorView = await repository.listForOwner({
      sourceTrackerId: clone._id.toString(),
      ownerId: contributor._id.toString(),
    });
    expect(contributorView).toMatchObject({
      ok: true,
      contributions: [{ id: created.contribution.id, status: 'pending' }],
    });

    const reviewed = await repository.review({
      sourceTrackerId: source._id.toString(),
      contributionId: created.contribution.id,
      ownerId: owner._id.toString(),
      action: 'approve',
      reviewNote: 'Excellent addition—thank you for the clear structure.',
    });
    expect(reviewed).toMatchObject({
      ok: true,
      contribution: {
        status: 'approved',
        reviewNote: 'Excellent addition—thank you for the clear structure.',
      },
    });

    const mergedTopic = await TrackerTopic.findOne({
      trackerId: source._id,
      title: 'Combinatorics',
    }).lean();
    expect(mergedTopic).toBeTruthy();
    const mergedSubtopics = await TrackerSubtopic.find({ topicId: mergedTopic?._id })
      .sort({ depth: 1 })
      .lean();
    expect(mergedSubtopics).toHaveLength(2);
    expect(mergedSubtopics[1]?.parentSubtopicId?.toString()).toBe(
      mergedSubtopics[0]?._id.toString()
    );
    await expect(Tracker.findById(source._id).lean()).resolves.toMatchObject({
      topicsCount: 2,
      subtopicsCount: 2,
    });
  });

  it('requires a dashboard clone before joining, then supports guild management and chat', async () => {
    const [owner, member, outsider] = await User.create([
      {
        fullName: 'Clan Owner',
        username: 'clan-owner',
        passwordHash: null,
        emailVerified: true,
      },
      {
        fullName: 'Clan Member',
        username: 'clan-member',
        passwordHash: null,
        emailVerified: true,
      },
      {
        fullName: 'Clan Outsider',
        username: 'clan-outsider',
        passwordHash: null,
        emailVerified: true,
      },
    ]);
    const tracker = await Tracker.create({
      ownerId: owner._id,
      title: 'System Design Guild',
      slug: 'system-design-guild',
      visibility: 'public',
      status: 'active',
      publishedAt: new Date(),
      topicsCount: 0,
      subtopicsCount: 0,
    });
    const clans = new MongoTrackerClanRepository();
    const managementRepository = new MongoTrackerManagementRepository();
    await expect(
      clans.getOverview({
        trackerId: tracker._id.toString(),
        userId: outsider._id.toString(),
      })
    ).resolves.toBeNull();
    await expect(
      clans.requestJoin({
        trackerId: tracker._id.toString(),
        userId: outsider._id.toString(),
      })
    ).resolves.toBeNull();
    await Tracker.create({
      ownerId: member._id,
      title: tracker.title,
      slug: 'system-design-guild-clone',
      sourceTrackerId: tracker._id,
      visibility: 'private',
      status: 'active',
    });
    const joined = await clans.requestJoin({
      trackerId: tracker._id.toString(),
      userId: member._id.toString(),
    });
    expect(joined).toMatchObject({ role: 'member', hasPendingJoinRequest: false });
    const joinedTrackerList = await managementRepository.listOwnedTrackers({
      userId: member._id.toString(),
      status: 'all',
      domain: 'all',
      sortBy: 'createdAt',
      page: 1,
      limit: 10,
    });
    expect(
      joinedTrackerList.trackers.find(
        (listedTracker) => String(listedTracker.sourceTrackerId) === tracker._id.toString()
      )
    ).toMatchObject({ clanRole: 'member' });
    const promoted = await clans.updateMemberRole({
      trackerId: tracker._id.toString(),
      ownerId: owner._id.toString(),
      memberId: member._id.toString(),
      role: 'co_owner',
    });
    expect(promoted?.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: member._id.toString(), role: 'co_owner' }),
      ])
    );

    await TrackerClanMessage.create({
      trackerId: tracker._id,
      userId: member._id,
      text: 'Hello guild!',
    });
    await TrackerClanMessage.create({
      trackerId: tracker._id,
      userId: member._id,
      text: 'Yesterday guild message',
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    });
    expect(TrackerClanMessage.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ createdAt: 1 }, expect.objectContaining({ expireAfterSeconds: 86_400 })],
      ])
    );
    await expect(
      clans.listMessages({
        trackerId: tracker._id.toString(),
        userId: member._id.toString(),
        limit: 20,
      })
    ).resolves.toEqual([
      expect.objectContaining({ text: 'Hello guild!', user: expect.objectContaining({ username: 'clan-member' }) }),
    ]);

    const pending = await TrackerTopicContribution.create({
      sourceTrackerId: tracker._id,
      cloneTrackerId: tracker._id,
      cloneTopicId: new mongoose.Types.ObjectId(),
      requesterId: owner._id,
      ownerId: owner._id,
      title: 'Caching Strategies',
      description: 'Reliable cache design and invalidation.',
      subtopics: [
        { sourceId: 'cache-1', title: 'Cache patterns', description: 'Read-through and write-through', order: 1, depth: 1, estimatedMinutes: 30 },
        { sourceId: 'cache-2', title: 'Invalidation', description: 'Expiry and active invalidation', order: 2, depth: 1, estimatedMinutes: 40 },
      ],
    });
    const contributions = new MongoTrackerTopicContributionRepository();
    const reviewed = await contributions.review({
      sourceTrackerId: tracker._id.toString(),
      contributionId: pending._id.toString(),
      ownerId: member._id.toString(),
      action: 'approve',
      reviewNote: 'Approved by co-owner.',
    });
    expect(reviewed).toMatchObject({ ok: true, contribution: { status: 'approved' } });
    await expect(TrackerSubtopic.countDocuments({ trackerId: tracker._id })).resolves.toBe(2);

    const mergedTopic = await TrackerTopic.findOne({
      trackerId: tracker._id,
      title: 'Caching Strategies',
    }).lean();
    const roots = await TrackerSubtopic.find({ topicId: mergedTopic?._id }).sort({ order: 1 });
    await TrackerSubtopic.create({
      trackerId: tracker._id,
      topicId: mergedTopic?._id,
      parentSubtopicId: roots[0]?._id,
      title: 'Nested cache exercise',
      description: '',
      order: 1,
      depth: 2,
      isLocked: true,
    });
    await Tracker.updateOne({ _id: tracker._id }, { $inc: { subtopicsCount: 1 } });
    await expect(
      clans.deleteSubtopic({
        trackerId: tracker._id.toString(),
        actorId: member._id.toString(),
        subtopicId: roots[0]!._id.toString(),
      })
    ).resolves.toBe(true);
    await expect(
      TrackerSubtopic.countDocuments({ trackerId: tracker._id, deletedAt: null })
    ).resolves.toBe(1);
    await expect(
      clans.deleteTopic({
        trackerId: tracker._id.toString(),
        actorId: member._id.toString(),
        topicId: mergedTopic!._id.toString(),
      })
    ).resolves.toBe(true);
    await expect(
      TrackerSubtopic.countDocuments({ trackerId: tracker._id, deletedAt: null })
    ).resolves.toBe(0);

    const retainedSourceTopic = await TrackerTopic.create({
      trackerId: tracker._id,
      title: 'Retained ownership roadmap',
      description: 'This content must survive the role transition.',
      order: 1,
      status: 'active',
    });
    await TrackerSubtopic.create({
      trackerId: tracker._id,
      topicId: retainedSourceTopic._id,
      title: 'Retained lesson',
      description: 'A lesson copied into the former owner personal tracker.',
      order: 1,
      depth: 1,
      isLocked: false,
    });
    await Tracker.updateOne(
      { _id: tracker._id },
      { $set: { topicsCount: 1, subtopicsCount: 1 } }
    );

    const openBattle = await clans.createChallenge({
      trackerId: tracker._id.toString(),
      challengerId: owner._id.toString(),
      durationMinutes: 10,
      questionCount: 5,
    });
    expect(openBattle).toMatchObject({
      challengeType: 'open',
      status: 'open',
      canCancel: true,
    });
    const acceptedBattle = await clans.acceptChallenge({
      trackerId: tracker._id.toString(),
      challengeId: openBattle!.id,
      userId: member._id.toString(),
    });
    expect(acceptedBattle).toMatchObject({
      status: 'active',
      canSubmit: true,
      opponent: { userId: member._id.toString() },
    });
    expect(acceptedBattle?.questions.length).toBeGreaterThan(0);
    expect(acceptedBattle?.questions[0]).not.toHaveProperty('correctAnswer');
    await clans.submitChallenge({
      trackerId: tracker._id.toString(),
      challengeId: openBattle!.id,
      userId: owner._id.toString(),
      answers: acceptedBattle!.questions.map((question) => ({
        questionId: question.id,
        answer: question.prompt.includes('unrelated') ? 'No' : 'Yes',
      })),
    });
    const completedBattle = await clans.submitChallenge({
      trackerId: tracker._id.toString(),
      challengeId: openBattle!.id,
      userId: member._id.toString(),
      answers: acceptedBattle!.questions.map((question) => ({
        questionId: question.id,
        answer: question.prompt.includes('unrelated') ? 'Yes' : 'No',
      })),
    });
    expect(completedBattle).toMatchObject({
      status: 'completed',
      winnerId: owner._id.toString(),
      challengerScore: acceptedBattle!.questions.length,
      opponentScore: 0,
    });

    const directBattle = await clans.createChallenge({
      trackerId: tracker._id.toString(),
      challengerId: owner._id.toString(),
      opponentId: member._id.toString(),
      durationMinutes: 5,
      questionCount: 3,
    });
    expect(directBattle).toMatchObject({ challengeType: 'direct', status: 'pending' });
    await expect(
      clans.declineChallenge({
        trackerId: tracker._id.toString(),
        challengeId: directBattle!.id,
        userId: member._id.toString(),
      })
    ).resolves.toMatchObject({ status: 'declined' });

    const transferred = await clans.transferOwnership({
      trackerId: tracker._id.toString(),
      ownerId: owner._id.toString(),
      newOwnerId: member._id.toString(),
    });
    expect(transferred).toMatchObject({
      role: 'co_owner',
      members: expect.arrayContaining([
        expect.objectContaining({ userId: member._id.toString(), role: 'owner' }),
        expect.objectContaining({ userId: owner._id.toString(), role: 'co_owner' }),
      ]),
    });
    await expect(Tracker.findById(tracker._id).lean()).resolves.toMatchObject({
      ownerId: member._id,
    });

    const demoted = await clans.updateMemberRole({
      trackerId: tracker._id.toString(),
      ownerId: member._id.toString(),
      memberId: owner._id.toString(),
      role: 'member',
    });
    expect(demoted?.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: owner._id.toString(), role: 'member' }),
      ])
    );
    const retainedClone = await Tracker.findOne({
      ownerId: owner._id,
      sourceTrackerId: tracker._id,
      deletedAt: null,
    }).lean();
    expect(retainedClone).toMatchObject({
      title: tracker.title,
      visibility: 'private',
      status: 'active',
    });
    await expect(
      TrackerTopic.countDocuments({ trackerId: retainedClone?._id, deletedAt: null })
    ).resolves.toBe(await TrackerTopic.countDocuments({ trackerId: tracker._id, deletedAt: null }));
    const retainedCloneTopic = await TrackerTopic.findOne({
      trackerId: retainedClone?._id,
      sourceTopicId: retainedSourceTopic._id,
      deletedAt: null,
    }).lean();
    expect(retainedCloneTopic).toMatchObject({ title: 'Retained ownership roadmap' });
    await expect(
      TrackerSubtopic.findOne({
        trackerId: retainedClone?._id,
        topicId: retainedCloneTopic?._id,
        deletedAt: null,
      }).lean()
    ).resolves.toMatchObject({ title: 'Retained lesson' });

    await expect(
      clans.leaveClan({
        trackerId: tracker._id.toString(),
        userId: member._id.toString(),
      })
    ).resolves.toBeNull();
    await clans.updateMemberRole({
      trackerId: tracker._id.toString(),
      ownerId: member._id.toString(),
      memberId: owner._id.toString(),
      role: 'co_owner',
    });
    const leftGuild = await clans.leaveClan({
      trackerId: tracker._id.toString(),
      userId: owner._id.toString(),
    });
    expect(leftGuild).toMatchObject({ role: 'outsider' });
    expect(leftGuild?.members).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: owner._id.toString() }),
      ])
    );
    await expect(Tracker.findById(retainedClone?._id)).resolves.not.toBeNull();
  });
});
