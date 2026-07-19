import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AIGenerationJob } from '../../src/infrastructure/database/models/ai-generation-job.model';
import { findActiveAIJob } from '../../src/infrastructure/queue/ai-job-enqueue';

describe('AI generation job lifecycle', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('expires an orphaned job instead of blocking future mock-test generation forever', async () => {
    const userId = new Types.ObjectId();
    const staleJob = await AIGenerationJob.create({
      userId,
      jobType: 'mock_test',
      status: 'pending',
      inputData: { topic: 'System Design' },
      totalSteps: 1,
      currentStep: 0,
    });
    await AIGenerationJob.collection.updateOne(
      { _id: staleJob._id },
      { $set: { updatedAt: new Date(Date.now() - 60_000) } }
    );

    await expect(
      findActiveAIJob({
        userId: userId.toString(),
        jobType: 'mock_test',
        staleAfterMs: 1_000,
      })
    ).resolves.toBeNull();

    await expect(AIGenerationJob.findById(staleJob._id).lean()).resolves.toMatchObject({
      status: 'failed',
      errorMessage: 'Generation did not start in time. Please try again.',
    });

    const freshJob = await AIGenerationJob.create({
      userId,
      jobType: 'mock_test',
      status: 'pending',
      inputData: { topic: 'Databases' },
      totalSteps: 1,
      currentStep: 0,
    });

    await expect(
      findActiveAIJob({
        userId: userId.toString(),
        jobType: 'mock_test',
        staleAfterMs: 1_000,
      })
    ).resolves.toEqual({ jobId: freshJob.id, status: 'pending' });
  });
});
