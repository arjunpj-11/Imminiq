import { GetAdminAITokenSpendUseCase } from './application/use-cases/get-admin-ai-token-spend.usecase';
import { mongoAdminAITokenSpendRepository } from './infrastructure/repositories/mongo-admin-ai-token-spend.repository';

export const createAdminAITokenSpendComposition = () => ({
  useCase: new GetAdminAITokenSpendUseCase(mongoAdminAITokenSpendRepository),
});
