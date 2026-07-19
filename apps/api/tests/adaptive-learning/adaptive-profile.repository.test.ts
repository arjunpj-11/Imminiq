import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AdaptiveLearningProfileModel } from '../../src/infrastructure/database/models/adaptive-learning-profile.model';
import { MongoAdaptiveLearningRepository } from '../../src/modules/user/adaptive-learning/infrastructure/repositories/internal/mongo-adaptive-learning.repository';

describe('MongoAdaptiveLearningRepository profile initialization', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await AdaptiveLearningProfileModel.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('atomically returns one profile when dashboard and generation initialize concurrently', async () => {
    const userId = new Types.ObjectId().toString();
    const repository = new MongoAdaptiveLearningRepository();

    const profiles = await Promise.all(
      Array.from({ length: 8 }, () => repository.getOrCreateProfile(userId))
    );

    expect(profiles).toHaveLength(8);
    expect(profiles.every((profile) => profile.masteryScore === 40)).toBe(true);
    expect(await AdaptiveLearningProfileModel.countDocuments({ userId })).toBe(1);
  });
});
