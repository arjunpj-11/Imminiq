import type { AdminListQuery, AdminPage } from '../../../shared'
import { ApiError } from '../../../../../shared/utils/ApiError'
import type { AdminMockTest, AdminMockTestDetail } from '../../domain/admin-mock-test.entity'
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface'
export interface IAdminMockTestsUseCase { list(query: AdminListQuery): Promise<AdminPage<AdminMockTest>>; getDetail(id: string): Promise<AdminMockTestDetail> }
export class AdminMockTestsUseCase implements IAdminMockTestsUseCase { constructor(private readonly repository: IAdminMockTestsRepository) {} list(query: AdminListQuery) { return this.repository.list(query) } async getDetail(id: string) { const test = await this.repository.getDetail(id); if (!test) throw new ApiError(404, 'Mock test not found', 'MOCK_TEST_NOT_FOUND'); return test } }
