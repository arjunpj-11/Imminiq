import type { IMockTestGenerationJobGateway } from '../services/mock-test-generation-job.interface'

export interface IGetActiveMockTestGenerationUseCase {
  execute(userId: string): Promise<{
    jobId: string
    status: 'pending' | 'processing'
  } | null>
}

export class GetActiveMockTestGenerationUseCase
  implements IGetActiveMockTestGenerationUseCase
{
  constructor(private readonly _jobGateway: IMockTestGenerationJobGateway) {}

  execute(userId: string) {
    return this._jobGateway.findActive(userId)
  }
}
