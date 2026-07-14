import { GetAdminAITokenSpendUseCase } from './application/get-admin-ai-token-spend.usecase';
import { mongoAdminAITokenSpendRepository } from './infrastructure/mongo-admin-ai-token-spend.repository';

export { createAdminAITokenSpendRoutes } from './presentation/admin-ai-token-spend.routes';

export const createAdminAITokenSpendComposition = () => ({
  useCase: new GetAdminAITokenSpendUseCase(mongoAdminAITokenSpendRepository),
});
