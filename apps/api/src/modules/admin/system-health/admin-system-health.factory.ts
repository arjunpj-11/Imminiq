import { GetAdminSystemHealthUseCase } from './application/use-cases/get-admin-system-health.usecase';
import { runtimeAdminSystemHealthRepository } from './infrastructure/repositories/runtime-admin-system-health.repository';
export const createAdminSystemHealthComposition = () => ({
  useCase: new GetAdminSystemHealthUseCase(runtimeAdminSystemHealthRepository),
});
