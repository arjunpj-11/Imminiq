import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { TrackerSubtopic } from '../../src/infrastructure/database/models/tracker-subtopic.model';
import { TrackerTopic } from '../../src/infrastructure/database/models/tracker-topic.model';
import { TrackerTopicContribution } from '../../src/infrastructure/database/models/tracker-topic-contribution.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import { MongoTrackerTopicContributionRepository } from '../../src/modules/user/trackers/infrastructure/repositories/mongo-tracker-topic-contribution.repository';
import { MongoTrackerManagementRepository } from '../../src/modules/user/trackers/infrastructure/repositories/internal/mongo-tracker-management.repository';
import { MongoTrackerProgressRepository } from '../../src/modules/user/trackers/infrastructure/repositories/internal/mongo-tracker-progress.repository';
import { PublishTrackerUseCase } from '../../src/modules/user/trackers/application/use-cases/publish-tracker.usecase';
import { TrackerMapper } from '../../src/modules/user/trackers/application/tracker.mapper';

describe('tracker topic contributions', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
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
});
