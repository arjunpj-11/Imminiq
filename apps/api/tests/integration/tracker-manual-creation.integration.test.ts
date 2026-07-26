import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { MongoTrackerManagementRepository } from '../../src/modules/user/trackers/infrastructure/repositories/internal/mongo-tracker-management.repository';

describe('manual tracker creation', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('persists a required unique slug for trackers with duplicate titles', async () => {
    const repository = new MongoTrackerManagementRepository();
    const userId = new mongoose.Types.ObjectId().toHexString();
    const first = await repository.createTracker({ userId, title: 'React Mastery' });
    const second = await repository.createTracker({ userId, title: 'React Mastery' });

    expect(first.slug).toMatch(/^react-mastery-[a-f0-9]{8}$/);
    expect(second.slug).toMatch(/^react-mastery-[a-f0-9]{8}$/);
    expect(second.slug).not.toBe(first.slug);
  });

  it('persists a custom reusable domain during manual creation', async () => {
    const repository = new MongoTrackerManagementRepository();
    const userId = new mongoose.Types.ObjectId().toHexString();

    const tracker = await repository.createTracker({
      userId,
      title: 'Classical Mechanics',
      domain: 'Physics',
    });

    expect(tracker.category).toBe('Physics');
    await expect(repository.listDomains('phys', 10)).resolves.toContain('Physics');
  });
});
