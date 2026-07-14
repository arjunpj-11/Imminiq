import type { IGetAdminMockTestDetailUseCase } from './use-cases/get-admin-mock-test-detail.usecase';
import type { IListAdminMockTestsUseCase } from './use-cases/list-admin-mock-tests.usecase';

export type AdminMockTestsUseCases = {
  list: IListAdminMockTestsUseCase;
  getDetail: IGetAdminMockTestDetailUseCase;
};
