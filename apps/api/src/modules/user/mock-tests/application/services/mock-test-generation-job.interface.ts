import type {
  ActiveMockTestGenerationJobDTO,
  GenerateMockTestPayloadDTO,
  PendingMockTestGenerationJobDTO,
} from '../mock-tests.dto';

export interface IMockTestGenerationJobGateway {
  findActive(userId: string): Promise<ActiveMockTestGenerationJobDTO | null>;

  enqueue(
    userId: string,
    payload: GenerateMockTestPayloadDTO
  ): Promise<PendingMockTestGenerationJobDTO>;
}
