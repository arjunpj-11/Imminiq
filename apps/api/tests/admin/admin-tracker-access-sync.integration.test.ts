import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { TrackerClanChallenge } from '../../src/infrastructure/database/models/tracker-clan-challenge.model';
import { MockTestAttemptModel } from '../../src/infrastructure/database/models/mock-test-attempt.model';
import { MockTestModel } from '../../src/infrastructure/database/models/mock-test.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import { MongoAdminTrackersRepository } from '../../src/modules/admin/trackers/infrastructure/repositories/mongo-admin-trackers.repository';
import { MongoTrackerClanRepository } from '../../src/modules/user/trackers/infrastructure/repositories/mongo-tracker-clan.repository';
import { MongoTrackerManagementRepository } from '../../src/modules/user/trackers/infrastructure/repositories/internal/mongo-tracker-management.repository';
import { ContentModerationAppealService } from '../../src/modules/user/moderation-appeals/infrastructure/services/mongo-content-moderation-appeal.service';

describe('admin tracker access synchronization', () => {
  let mongo: MongoMemoryReplSet;

  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('lists only originals, keeps personal clones usable, and closes source clan access', async () => {
    const [owner, learner] = await User.create([
      {
        fullName: 'Original Owner',
        username: 'original-owner-sync',
        passwordHash: null,
        emailVerified: true,
      },
      {
        fullName: 'Clone Learner',
        username: 'clone-learner-sync',
        passwordHash: null,
        emailVerified: true,
      },
    ]);
    const original = await Tracker.create({
      ownerId: owner._id,
      title: 'Original Biology Tracker',
      slug: 'original-biology-tracker-sync',
      visibility: 'public',
      publishedAt: new Date(),
      status: 'active',
      cloneCount: 1,
    });
    const clone = await Tracker.create({
      ownerId: learner._id,
      title: original.title,
      slug: 'personal-biology-clone-sync',
      sourceTrackerId: original._id,
      visibility: 'private',
      status: 'active',
    });
    const challenge = await TrackerClanChallenge.create({
      trackerId: original._id,
      challengerId: owner._id,
      opponentId: learner._id,
      participantIds: [owner._id, learner._id],
      challengeType: 'direct',
      status: 'active',
      durationMinutes: 10,
      totalNodes: 3,
      questions: [1, 2, 3].map((index) => ({
        prompt: `Question ${index}`,
        options: ['A', 'B'],
        correctAnswer: 'A',
        topicTitle: 'Biology',
      })),
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 10 * 60_000),
      acceptBy: new Date(Date.now() + 60_000),
    });

    const admin = new MongoAdminTrackersRepository();
    const management = new MongoTrackerManagementRepository();
    const clans = new MongoTrackerClanRepository({ ensureClone: async () => true });
    const inventory = await admin.list({ page: 1, limit: 20, status: 'all' });

    expect(inventory.items).toHaveLength(1);
    expect(inventory.items[0]).toMatchObject({ id: original.id, cloneCount: 1 });
    await expect(clans.getRole({ trackerId: original.id, userId: owner.id })).resolves.toBe(
      'owner'
    );

    await admin.updateLifecycle(
      original.id,
      {
        action: 'suspend',
        reasonCode: 'unsafe_content',
        reason: 'The original tracker requires administrative review.',
        notifyOwner: false,
      },
      {
        userId: owner.id,
        role: 'superadmin',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      }
    );

    const ownerTrackers = await management.listOwnedTrackers({
      userId: owner.id,
      status: 'all',
      domain: 'all',
      sortBy: 'createdAt',
      page: 1,
      limit: 20,
    });
    expect(ownerTrackers.trackers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: original._id,
          moderationStatus: 'suspended',
        }),
      ])
    );
    await expect(
      management.findOwnedTrackerById({ trackerId: original.id, userId: owner.id })
    ).resolves.toBeNull();
    await expect(
      management.findOwnedTrackerForDisplayById({ trackerId: original.id, userId: owner.id })
    ).resolves.toMatchObject({ _id: original._id, moderationStatus: 'suspended' });

    await expect(Tracker.findById(clone._id).lean()).resolves.toMatchObject({
      moderationStatus: 'active',
      deletedAt: null,
    });
    const learnerTrackers = await management.listOwnedTrackers({
      userId: learner.id,
      status: 'all',
      domain: 'all',
      sortBy: 'createdAt',
      page: 1,
      limit: 20,
    });
    expect(learnerTrackers.trackers.map((tracker) => tracker._id.toString())).toContain(clone.id);
    await expect(clans.getRole({ trackerId: original.id, userId: owner.id })).resolves.toBeNull();
    await expect(
      clans.listMessages({ trackerId: original.id, userId: owner.id, limit: 20 })
    ).resolves.toBeNull();
    await expect(
      clans.syncPersonalClone({ trackerId: original.id, userId: learner.id })
    ).resolves.toBeNull();
    await expect(TrackerClanChallenge.findById(challenge._id).lean()).resolves.toMatchObject({
      status: 'cancelled',
    });
  });

  it('allows a mock-test owner or affected learner to appeal, but keeps tracker appeals owner-only', async () => {
    const [owner, learner, stranger] = await User.create([
      {
        fullName: 'Appeal Owner',
        username: 'appeal-owner-sync',
        passwordHash: null,
        emailVerified: true,
      },
      {
        fullName: 'Affected Learner',
        username: 'affected-learner-sync',
        passwordHash: null,
        emailVerified: true,
      },
      {
        fullName: 'Unrelated Learner',
        username: 'unrelated-learner-sync',
        passwordHash: null,
        emailVerified: true,
      },
    ]);
    const test = await MockTestModel.create({
      ownerId: owner._id,
      title: 'Suspended assessment',
      questionCount: 1,
      moderationStatus: 'suspended',
    });
    await MockTestAttemptModel.create({
      testId: test._id,
      userId: learner._id,
      status: 'completed',
      totalQuestions: 1,
      answeredQuestions: 1,
    });
    const tracker = await Tracker.create({
      ownerId: owner._id,
      title: 'Suspended owner tracker',
      slug: 'suspended-owner-tracker-appeal-sync',
      moderationStatus: 'suspended',
    });
    const appeals = new ContentModerationAppealService();

    await expect(
      appeals.submit({
        userId: learner.id,
        targetType: 'mock_test',
        targetId: test.id,
        reason: 'This moderation interrupted my active assessment and needs another review.',
        evidenceUrls: [],
      })
    ).resolves.toMatchObject({ targetType: 'mock_test', targetId: test.id, status: 'pending' });
    await expect(
      appeals.submit({
        userId: stranger.id,
        targetType: 'mock_test',
        targetId: test.id,
        reason: 'I should not be eligible because this assessment never affected my account.',
        evidenceUrls: [],
      })
    ).rejects.toMatchObject({ code: 'CONTENT_APPEAL_FORBIDDEN' });
    await expect(
      appeals.submit({
        userId: learner.id,
        targetType: 'tracker',
        targetId: tracker.id,
        reason: 'I should not be eligible because I am not the owner of this tracker.',
        evidenceUrls: [],
      })
    ).rejects.toMatchObject({ code: 'CONTENT_APPEAL_FORBIDDEN' });
  });
});
