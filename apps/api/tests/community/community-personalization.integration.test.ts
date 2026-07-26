import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { TrackerProgress } from '../../src/infrastructure/database/models/tracker-progress.model';
import { User } from '../../src/infrastructure/database/models/user.model';
import { MongoCommunityTrackerRepository } from '../../src/modules/user/community/infrastructure/repositories/internal/mongo-community-tracker.repository';

describe('community discovery personalization', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  beforeEach(async () => {
    await Promise.all([
      Tracker.deleteMany({}),
      TrackerProgress.deleteMany({}),
      User.deleteMany({}),
    ]);
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

  it('does not suggest public trackers that are already on the learner’s dashboard', async () => {
    const [learner, owner] = await Promise.all([
      User.create({ fullName: 'Learner Two', username: 'learner-two', passwordHash: null }),
      User.create({ fullName: 'Community Owner', username: 'community-owner', passwordHash: null }),
    ]);
    const [clonedSource, startedSource, availableSource] = await Tracker.create([
      {
        ownerId: owner._id,
        title: 'React Fundamentals',
        slug: 'react-fundamentals-source',
        category: 'Frontend',
        tags: ['react'],
        visibility: 'public',
        status: 'active',
        allowClone: true,
        ratingAverage: 5,
        publishedAt: new Date(),
      },
      {
        ownerId: owner._id,
        title: 'React Testing',
        slug: 'react-testing-source',
        category: 'Frontend',
        tags: ['react', 'testing'],
        visibility: 'public',
        status: 'active',
        allowClone: true,
        ratingAverage: 4.9,
        publishedAt: new Date(),
      },
      {
        ownerId: owner._id,
        title: 'Advanced React',
        slug: 'advanced-react-available',
        category: 'Frontend',
        tags: ['react'],
        visibility: 'public',
        status: 'active',
        allowClone: false,
        ratingAverage: 4.8,
        publishedAt: new Date(),
      },
    ]);
    await Promise.all([
      Tracker.create({
        ownerId: learner._id,
        title: 'My React Fundamentals',
        slug: 'my-react-fundamentals-clone',
        category: 'Frontend',
        visibility: 'private',
        status: 'active',
        sourceTrackerId: clonedSource._id,
      }),
      TrackerProgress.create({
        userId: learner._id,
        trackerId: startedSource._id,
        totalTopics: 3,
        completedTopics: 0,
        totalSubtopics: 8,
        completedSubtopics: 0,
        completionPercentage: 0,
      }),
    ]);

    const repository = new MongoCommunityTrackerRepository();
    const suggestions = await repository.findPublicTrackers({
      userId: learner.id,
      sort: 'top-rated',
      page: 1,
      limit: 15,
    });

    expect(suggestions.items.map((tracker) => tracker.id)).toEqual([
      availableSource._id.toString(),
    ]);
    expect(suggestions.items.every((tracker) => !tracker.inDashboard)).toBe(true);

    await expect(
      repository.cloneTrackerForUser(availableSource._id.toString(), learner.id)
    ).resolves.toMatchObject({
      title: 'Advanced React',
      inDashboard: true,
    });
  });
});
