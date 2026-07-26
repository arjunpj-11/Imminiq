import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import { MongoCommunityTrackerRepository } from '../../src/modules/user/community/infrastructure/repositories/internal/mongo-community-tracker.repository';

describe('community discovery personalization', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  beforeEach(async () => {
    await Promise.all([Tracker.deleteMany({}), User.deleteMany({})]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('ranks suggestions from the learner’s trackers while keeping searched results paginated', async () => {
    const [learner, reactOwner, cookingOwner] = await Promise.all([
      User.create({ fullName: 'Learner One', username: 'learner', passwordHash: null }),
      User.create({ fullName: 'React Mentor', username: 'reactmentor', passwordHash: null }),
      User.create({ fullName: 'Cooking Mentor', username: 'cookmentor', passwordHash: null }),
    ]);
    await Tracker.create({
      ownerId: learner._id,
      title: 'React foundations',
      slug: 'my-react-foundations',
      category: 'Frontend',
      tags: ['react', 'typescript'],
      visibility: 'private',
      status: 'active',
    });
    await Tracker.create([
      {
        ownerId: reactOwner._id,
        title: 'Advanced React Patterns',
        slug: 'advanced-react-patterns',
        description: 'React and TypeScript architecture.',
        category: 'Frontend',
        tags: ['react', 'typescript'],
        visibility: 'public',
        status: 'active',
        allowClone: true,
        ratingAverage: 3.8,
        publishedAt: new Date(),
      },
      {
        ownerId: cookingOwner._id,
        title: 'Professional Cooking',
        slug: 'professional-cooking',
        description: 'Kitchen techniques and recipes.',
        category: 'Cooking',
        visibility: 'public',
        status: 'active',
        allowClone: true,
        ratingAverage: 5,
        publishedAt: new Date(),
      },
      {
        ownerId: cookingOwner._id,
        title: 'Cooking Basics',
        slug: 'cooking-basics',
        description: 'Everyday kitchen skills.',
        category: 'Cooking',
        visibility: 'public',
        status: 'active',
        allowClone: true,
        ratingAverage: 4.5,
        publishedAt: new Date(),
      },
    ]);

    const repository = new MongoCommunityTrackerRepository();
    const suggestions = await repository.findPublicTrackers({
      userId: learner.id,
      sort: 'top-rated',
      page: 1,
      limit: 15,
    });
    expect(suggestions.items[0]?.title).toBe('Advanced React Patterns');
    expect(suggestions.totalPages).toBe(1);

    const search = await repository.findPublicTrackers({
      userId: learner.id,
      search: 'Cooking',
      sort: 'top-rated',
      page: 1,
      limit: 1,
    });
    expect(search.total).toBe(2);
    expect(search.totalPages).toBe(2);
    expect(search.items).toHaveLength(1);
  });
});
