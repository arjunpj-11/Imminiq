import { describe, expect, it, vi } from 'vitest';

import { GetMockTestGenerationStatusUseCase } from '../../src/modules/user/mock-tests/application/use-cases/get-mock-test-generation-status.usecase';
import type { IMockTestGenerationJobGateway } from '../../src/modules/user/mock-tests/application/services/mock-test-generation-job.interface';

describe('GetMockTestGenerationStatusUseCase', () => {
  it('returns only the requesting user’s mock-test job status', async () => {
    const getStatus = vi.fn().mockResolvedValue({
      jobId: 'job-1',
      status: 'completed',
      testId: 'test-1',
    });
    const useCase = new GetMockTestGenerationStatusUseCase({
      getStatus,
    } as unknown as IMockTestGenerationJobGateway);

    await expect(useCase.execute('user-1', 'job-1')).resolves.toEqual({
      jobId: 'job-1',
      status: 'completed',
      testId: 'test-1',
    });
    expect(getStatus).toHaveBeenCalledWith('user-1', 'job-1');
  });

  it('does not expose jobs outside the mock-test generation boundary', async () => {
    const useCase = new GetMockTestGenerationStatusUseCase({
      getStatus: vi.fn().mockResolvedValue(null),
    } as unknown as IMockTestGenerationJobGateway);

    await expect(useCase.execute('user-1', 'roadmap-job-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
