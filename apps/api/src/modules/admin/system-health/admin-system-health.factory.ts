import type { AdminSystemHealthUseCases } from './application/admin-system-health-use-cases.contract';
import { GetAdminSystemHealthUseCase } from './application/use-cases/get-admin-system-health.usecase';
import { runtimeAdminSystemHealthRepository } from './infrastructure/repositories/runtime-admin-system-health.repository';
export type AdminSystemHealthComposition = { useCases: AdminSystemHealthUseCases };

export const createAdminSystemHealthComposition = (): AdminSystemHealthComposition => ({
  useCases: { get: new GetAdminSystemHealthUseCase(runtimeAdminSystemHealthRepository) },
});
