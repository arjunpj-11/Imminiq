import type {
  ActiveMockTestGenerationJobDTO,
  GenerateMockTestPayloadDTO,
  MockTestGenerationStatusDTO,
  PendingMockTestGenerationJobDTO,
} from '../mock-tests.dto';

export interface IMockTestGenerationJobGateway {
  findActive(userId: string): Promise<ActiveMockTestGenerationJobDTO | null>;

  getStatus(userId: string, jobId: string): Promise<MockTestGenerationStatusDTO | null>;

  enqueue(
    userId: string,
    payload: GenerateMockTestPayloadDTO
  ): Promise<PendingMockTestGenerationJobDTO>;
}
