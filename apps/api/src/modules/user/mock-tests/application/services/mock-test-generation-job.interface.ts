import type { GenerateMockTestPayloadDTO } from '../mock-tests.dto';

export interface IMockTestGenerationJobGateway {
  findActive(userId: string): Promise<{
    jobId: string;
    status: 'pending' | 'processing';
  } | null>;

  enqueue(
    userId: string,
    payload: GenerateMockTestPayloadDTO
  ): Promise<{ jobId: string; status: 'pending' }>;
}
