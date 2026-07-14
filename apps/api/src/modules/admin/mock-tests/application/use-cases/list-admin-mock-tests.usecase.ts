import type { AdminListQuery, AdminPage } from '../../../shared';
import type { AdminMockTest } from '../../domain/entities/admin-mock-test.entity';
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';

export interface IListAdminMockTestsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminMockTest>>;
}

export class ListAdminMockTestsUseCase implements IListAdminMockTestsUseCase {
  constructor(private readonly repository: IAdminMockTestsRepository) {}

  execute(query: AdminListQuery): Promise<AdminPage<AdminMockTest>> {
    return this.repository.list(query);
  }
}
