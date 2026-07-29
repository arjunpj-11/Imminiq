import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { LessonVisualization } from '../../src/infrastructure/database/models/lesson-visualization.model';
import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { TrackerSubtopic } from '../../src/infrastructure/database/models/tracker-subtopic.model';
import { TrackerTopic } from '../../src/infrastructure/database/models/tracker-topic.model';
import { MongoTrackerLessonRepository } from '../../src/modules/user/trackers/infrastructure/repositories/internal/mongo-tracker-lesson.repository';

describe('shared lesson visualization', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('reuses one canonical visualization across the original tracker and its clone', async () => {
    const sourceOwnerId = new Types.ObjectId();
    const cloneOwnerId = new Types.ObjectId();
    const sourceTracker = await Tracker.create({
      ownerId: sourceOwnerId,
      title: 'Computer Networks',
      slug: 'computer-networks-source',
      visibility: 'public',
      status: 'active',
    });
    const clonedTracker = await Tracker.create({
      ownerId: cloneOwnerId,
      sourceTrackerId: sourceTracker._id,
      title: sourceTracker.title,
      slug: 'computer-networks-clone',
      visibility: 'private',
      status: 'active',
    });
    const sourceTopic = await TrackerTopic.create({
      trackerId: sourceTracker._id,
      title: 'Networking basics',
      order: 1,
      status: 'active',
    });
    const clonedTopic = await TrackerTopic.create({
      trackerId: clonedTracker._id,
      sourceTopicId: sourceTopic._id,
      title: sourceTopic.title,
      order: 1,
      status: 'active',
    });
    const sourceSubtopic = await TrackerSubtopic.create({
      trackerId: sourceTracker._id,
      topicId: sourceTopic._id,
      title: 'DNS request flow',
      order: 1,
      depth: 1,
    });
    const clonedSubtopic = await TrackerSubtopic.create({
      trackerId: clonedTracker._id,
      topicId: clonedTopic._id,
      sourceSubtopicId: sourceSubtopic._id,
      title: sourceSubtopic.title,
      order: 1,
      depth: 1,
    });
    const repository = new MongoTrackerLessonRepository();

    await repository.saveLessonVisualization({
      trackerId: sourceTracker.id,
      subtopicId: sourceSubtopic.id,
      userId: sourceOwnerId.toHexString(),
      html: '<!DOCTYPE html><html><canvas></canvas><script></script></html>',
      visualTitle: 'DNS request flow',
      visualDescription: 'A shared DNS visualization',
    });

    await expect(
      repository.findLessonVisualization({
        trackerId: clonedTracker.id,
        subtopicId: clonedSubtopic.id,
      })
    ).resolves.toMatchObject({
      visualTitle: 'DNS request flow',
      visualDescription: 'A shared DNS visualization',
    });

    await repository.saveLessonVisualization({
      trackerId: clonedTracker.id,
      subtopicId: clonedSubtopic.id,
      userId: cloneOwnerId.toHexString(),
      html: '<!DOCTYPE html><html><canvas></canvas><script>updated</script></html>',
      visualTitle: 'Updated DNS request flow',
      visualDescription: 'The same shared visualization was updated',
    });

    await expect(LessonVisualization.countDocuments({ deletedAt: null })).resolves.toBe(1);
    await expect(
      repository.findLessonVisualization({
        trackerId: sourceTracker.id,
        subtopicId: sourceSubtopic.id,
      })
    ).resolves.toMatchObject({
      visualTitle: 'Updated DNS request flow',
    });

    const saved = await LessonVisualization.findOne().lean();
    expect(saved?.contentKey).toBe(`${sourceTracker.id}:${sourceSubtopic.id}`);
    expect(saved?.userId.toString()).toBe(sourceOwnerId.toHexString());
  });
});
