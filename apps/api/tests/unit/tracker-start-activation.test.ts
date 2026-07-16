import { afterEach, describe, expect, it, vi } from 'vitest';

import { Tracker } from '../../src/infrastructure/database/models/tracker.model';
import { TrackerProgress } from '../../src/infrastructure/database/models/tracker-progress.model';
import { TrackerSubtopic } from '../../src/infrastructure/database/models/tracker-subtopic.model';
import { TrackerTopic } from '../../src/infrastructure/database/models/tracker-topic.model';
import { MongoTrackerProgressRepository } from '../../src/modules/user/trackers/infrastructure/repositories/internal/mongo-tracker-progress.repository';

describe('tracker start activation', () => {
  afterEach(() => vi.restoreAllMocks());

  it('promotes an owned draft tracker when study progress is first initialized', async () => {
    vi.spyOn(TrackerTopic, 'find').mockReturnValue({
      sort: () => ({ lean: () => Promise.resolve([]) }),
    } as never);
    vi.spyOn(TrackerSubtopic, 'find').mockReturnValue({
      sort: () => ({ lean: () => Promise.resolve([]) }),
    } as never);
    vi.spyOn(TrackerProgress, 'findOneAndUpdate').mockResolvedValue(null);
    const updateTracker = vi.spyOn(Tracker, 'updateOne').mockResolvedValue({} as never);

    await new MongoTrackerProgressRepository().ensureUserProgressInitialized({
      userId: '64b000000000000000000001',
      trackerId: '64b000000000000000000002',
    });

    expect(updateTracker).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'draft',
        deletedAt: null,
        moderationStatus: { $in: ['active', null] },
      }),
      expect.objectContaining({ $set: expect.objectContaining({ status: 'active' }) })
    );
  });
});
