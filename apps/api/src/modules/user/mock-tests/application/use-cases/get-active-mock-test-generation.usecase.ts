import type { IMockTestGenerationJobGateway } from '../services/mock-test-generation-job.interface';
import type { ActiveMockTestGenerationJobDTO } from '../mock-tests.dto';

export interface IGetActiveMockTestGenerationUseCase {
  execute(userId: string): Promise<ActiveMockTestGenerationJobDTO | null>;
}

export class GetActiveMockTestGenerationUseCase implements IGetActiveMockTestGenerationUseCase {
  constructor(private readonly _jobGateway: IMockTestGenerationJobGateway) {}

  execute(userId: string) {
    return this._jobGateway.findActive(userId);
  }
}
