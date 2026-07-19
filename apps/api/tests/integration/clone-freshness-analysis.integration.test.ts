import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { MongoCloneFreshnessAnalysisRepository } from '../../src/modules/user/tracker-creation/infrastructure/repositories/mongo-clone-freshness-analysis.repository';
import { MongoTrackerManagementRepository } from '../../src/modules/user/trackers/infrastructure/repositories/internal/mongo-tracker-management.repository';

describe('clone freshness analysis history', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Tracker.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('does not restore the one-time analysis after an analyzed clone is deleted and cloned again', async () => {
    const ownerId = new Types.ObjectId();
    const sourceOwnerId = new Types.ObjectId();
    const source = await Tracker.create({
      ownerId: sourceOwnerId,
      title: 'Public system design roadmap',
      slug: 'public-system-design-roadmap',
      visibility: 'public',
      status: 'active',
    });

    await Tracker.create({
      ownerId,
      sourceTrackerId: source._id,
      title: source.title,
      slug: 'deleted-analyzed-system-design-clone',
      visibility: 'private',
      status: 'active',
      cloneFreshnessAnalysisStatus: 'completed',
      cloneFreshnessAnalyzedAt: new Date(),
      deletedAt: new Date(),
    });

    const replacementClone = await Tracker.create({
      ownerId,
      sourceTrackerId: source._id,
      title: source.title,
      slug: 'replacement-system-design-clone',
      visibility: 'private',
      status: 'active',
    });

    const repository = new MongoCloneFreshnessAnalysisRepository();

    await expect(
      repository.claim({ trackerId: replacementClone.id, userId: ownerId.toString() })
    ).resolves.toEqual({ status: 'already_used' });

    const unchangedReplacement = await Tracker.findById(replacementClone._id).lean();
    expect(unchangedReplacement?.cloneFreshnessAnalysisStatus).toBeNull();

    const trackerList = await new MongoTrackerManagementRepository().listOwnedTrackers({
      userId: ownerId.toString(),
      status: 'all',
      domain: 'all',
      sortBy: 'lastActive',
      page: 1,
      limit: 10,
    });
    expect(trackerList.trackers).toEqual([
      expect.objectContaining({
        _id: replacementClone._id,
        cloneFreshnessAnalysisAvailable: false,
      }),
    ]);
  });
});
