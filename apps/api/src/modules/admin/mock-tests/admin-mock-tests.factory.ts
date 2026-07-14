import type { AdminMockTestsUseCases } from './application/admin-mock-tests-use-cases.contract';
import { GetAdminMockTestDetailUseCase } from './application/use-cases/get-admin-mock-test-detail.usecase';
import { ListAdminMockTestsUseCase } from './application/use-cases/list-admin-mock-tests.usecase';
import { mongoAdminMockTestsRepository } from './infrastructure/repositories/mongo-admin-mock-tests.repository';
export type AdminMockTestsComposition = { useCases: AdminMockTestsUseCases };

export const createAdminMockTestsComposition = (): AdminMockTestsComposition => ({
  useCases: {
    list: new ListAdminMockTestsUseCase(mongoAdminMockTestsRepository),
    getDetail: new GetAdminMockTestDetailUseCase(mongoAdminMockTestsRepository),
  },
});
