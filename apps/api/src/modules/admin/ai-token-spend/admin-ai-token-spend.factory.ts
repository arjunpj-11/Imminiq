import type { AdminAITokenSpendUseCases } from './application/admin-ai-token-spend-use-cases.contract';
import { GetAdminAITokenSpendUseCase } from './application/use-cases/get-admin-ai-token-spend.usecase';
import { mongoAdminAITokenSpendRepository } from './infrastructure/repositories/mongo-admin-ai-token-spend.repository';
import { AdminAITokenSpendMapper } from './application/admin-ai-token-spend.mapper';

export type AdminAITokenSpendComposition = { useCases: AdminAITokenSpendUseCases };

export const createAdminAITokenSpendComposition = (): AdminAITokenSpendComposition => {
  const mapper = new AdminAITokenSpendMapper();
  return {
    useCases: {
      get: new GetAdminAITokenSpendUseCase(mongoAdminAITokenSpendRepository, mapper),
    },
  };
};
