import type { IMockTestGenerationJobGateway } from '../services/mock-test-generation-job.interface';
import type { IGenerateMockTestPayloadDTO } from '../mock-tests.dto';
import { MockTestsApplicationError } from '../mock-tests-application.error';

export interface IStartMockTestGenerationUseCase {
  execute(
    userId: string,
    payload: IGenerateMockTestPayloadDTO
  ): Promise<{ jobId: string; status: 'pending' }>;
}

export class StartMockTestGenerationUseCase implements IStartMockTestGenerationUseCase {
  constructor(private readonly _jobGateway: IMockTestGenerationJobGateway) {}

  async execute(userId: string, payload: IGenerateMockTestPayloadDTO) {
    if (await this._jobGateway.findActive(userId)) {
      throw MockTestsApplicationError.generationAlreadyActive();
    }

    const { runInBackground: _, ...jobPayload } = payload;

    return this._jobGateway.enqueue(userId, jobPayload);
  }
}
