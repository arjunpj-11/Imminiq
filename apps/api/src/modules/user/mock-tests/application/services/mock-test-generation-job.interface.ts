import type { IGenerateMockTestPayloadDTO } from '../mock-tests.dto'

export interface IMockTestGenerationJobGateway {
  enqueue(
    userId: string,
    payload: IGenerateMockTestPayloadDTO,
  ): Promise<{ jobId: string; status: 'pending' }>
}
