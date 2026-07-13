import type { IMockTestGenerationJobGateway } from '../services/mock-test-generation-job.interface'
import type { IGenerateMockTestPayloadDTO } from '../mock-tests.dto'

export interface IStartMockTestGenerationUseCase {
  execute(
    userId: string,
    payload: IGenerateMockTestPayloadDTO,
  ): Promise<{ jobId: string; status: 'pending' }>
}

export class StartMockTestGenerationUseCase
  implements IStartMockTestGenerationUseCase
{
  constructor(
    private readonly _jobGateway: IMockTestGenerationJobGateway,
  ) {}

  execute(userId: string, payload: IGenerateMockTestPayloadDTO) {
    const { runInBackground: _, ...jobPayload } = payload

    return this._jobGateway.enqueue(userId, jobPayload)
  }
}
