import type { AdminAITokenSpendUseCases } from './application/admin-ai-token-spend-use-cases.contract';
import { GetAdminAITokenSpendUseCase } from './application/use-cases/get-admin-ai-token-spend.usecase';
import { mongoAdminAITokenSpendRepository } from './infrastructure/repositories/mongo-admin-ai-token-spend.repository';

export type AdminAITokenSpendComposition = { useCases: AdminAITokenSpendUseCases };

export const createAdminAITokenSpendComposition = (): AdminAITokenSpendComposition => ({
  useCases: { get: new GetAdminAITokenSpendUseCase(mongoAdminAITokenSpendRepository) },
});
