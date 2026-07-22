import type { IGetAdminSystemHealthUseCase } from './use-cases/get-admin-system-health.usecase';
import type { IAdminJobWorklistService } from './admin-job-worklist.service';

export type AdminSystemHealthUseCases = {
  get: IGetAdminSystemHealthUseCase;
  jobs: IAdminJobWorklistService;
};
