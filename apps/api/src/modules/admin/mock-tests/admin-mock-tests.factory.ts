import type { AdminMockTestsUseCases } from './application/admin-mock-tests-use-cases.contract';
import { GetAdminMockTestDetailUseCase } from './application/use-cases/get-admin-mock-test-detail.usecase';
import { ListAdminMockTestsUseCase } from './application/use-cases/list-admin-mock-tests.usecase';
import { mongoAdminMockTestsRepository } from './infrastructure/repositories/mongo-admin-mock-tests.repository';
import { AdminMockTestsMapper } from './application/admin-mock-tests.mapper';
export type AdminMockTestsComposition = { useCases: AdminMockTestsUseCases };

export const createAdminMockTestsComposition = (): AdminMockTestsComposition => {
  const mapper = new AdminMockTestsMapper();
  return {
    useCases: {
      list: new ListAdminMockTestsUseCase(mongoAdminMockTestsRepository, mapper),
      getDetail: new GetAdminMockTestDetailUseCase(mongoAdminMockTestsRepository, mapper),
    },
  };
};
