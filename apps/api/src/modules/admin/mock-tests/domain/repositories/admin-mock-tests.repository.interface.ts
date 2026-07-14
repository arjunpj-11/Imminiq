import type { AdminListQuery, AdminPage } from '../../../shared';
import type { AdminMockTest, AdminMockTestDetail } from '../entities/admin-mock-test.entity';
export interface IAdminMockTestsRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminMockTest>>;
  getDetail(id: string): Promise<AdminMockTestDetail | null>;
}
