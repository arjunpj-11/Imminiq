import type { MockTestGenerationStatusDTO } from '../mock-tests.dto';
import type { IMockTestGenerationJobGateway } from '../services/mock-test-generation-job.interface';
import { MockTestsApplicationError } from '../mock-tests-application.error';

export interface IGetMockTestGenerationStatusUseCase {
  execute(userId: string, jobId: string): Promise<MockTestGenerationStatusDTO>;
}

export class GetMockTestGenerationStatusUseCase implements IGetMockTestGenerationStatusUseCase {
  constructor(private readonly _jobGateway: IMockTestGenerationJobGateway) {}

  async execute(userId: string, jobId: string): Promise<MockTestGenerationStatusDTO> {
    const job = await this._jobGateway.getStatus(userId, jobId);

    if (!job) {
      throw MockTestsApplicationError.notFound('Mock-test generation job not found');
    }

    return job;
  }
}
