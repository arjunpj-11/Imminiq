import { afterEach, describe, expect, it, vi } from 'vitest';

import { AIGenerationJob } from '../../src/infrastructure/database/models/ai-generation-job.model';
import {
  enqueueAIJobOrMarkFailed,
  findActiveAIJob,
} from '../../src/infrastructure/queue/ai-job-enqueue';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('findActiveAIJob', () => {
  it('expires stale jobs before returning the latest active job', async () => {
    const updateMany = vi.spyOn(AIGenerationJob, 'updateMany').mockResolvedValue({} as never);
    const lean = vi.fn().mockResolvedValue({
      _id: { toString: () => 'job-2' },
      status: 'processing',
    });
    const select = vi.fn().mockReturnValue({ lean });
    const sort = vi.fn().mockReturnValue({ select });
    const findOne = vi.spyOn(AIGenerationJob, 'findOne').mockReturnValue({ sort } as never);

    await expect(
      findActiveAIJob({ userId: 'user-1', jobType: 'mock_test', staleAfterMs: 1_000 })
    ).resolves.toEqual({ jobId: 'job-2', status: 'processing' });

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        jobType: 'mock_test',
        status: { $in: ['pending', 'processing'] },
        updatedAt: { $lt: expect.any(Date) },
      }),
      {
        $set: {
          status: 'failed',
          errorMessage: 'Generation did not start in time. Please try again.',
          completedAt: expect.any(Date),
        },
      }
    );
    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        jobType: 'mock_test',
        status: { $in: ['pending', 'processing'] },
      })
    );
  });
});

describe('enqueueAIJobOrMarkFailed', () => {
  it('marks the persisted job failed when the queue rejects it', async () => {
    const update = vi.spyOn(AIGenerationJob, 'findByIdAndUpdate').mockResolvedValue(null);
    const queueError = new Error('Redis unavailable');

    await expect(
      enqueueAIJobOrMarkFailed('job-1', async () => {
        throw queueError;
      })
    ).rejects.toBe(queueError);

    expect(update).toHaveBeenCalledWith('job-1', {
      status: 'failed',
      errorMessage: 'Generation could not be queued. Please try again.',
      completedAt: expect.any(Date),
    });
  });
});
