import { AdminMockTestsUseCase } from './application/use-cases/admin-mock-tests.usecase';
import { mongoAdminMockTestsRepository } from './infrastructure/repositories/mongo-admin-mock-tests.repository';
export const createAdminMockTestsComposition = () => ({
  useCase: new AdminMockTestsUseCase(mongoAdminMockTestsRepository),
});
