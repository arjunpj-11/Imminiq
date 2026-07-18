import type { AdminListQuery, AdminPage } from '../../../../../shared/admin';
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';
import type { AdminMockTestDTO } from '../admin-mock-tests.dto';
import type { IAdminMockTestsMapper } from '../admin-mock-tests.mapper';

export interface IListAdminMockTestsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminMockTestDTO>>;
}

export class ListAdminMockTestsUseCase implements IListAdminMockTestsUseCase {
  constructor(
    private readonly repository: IAdminMockTestsRepository,
    private readonly mapper: IAdminMockTestsMapper
  ) {}

  async execute(query: AdminListQuery): Promise<AdminPage<AdminMockTestDTO>> {
    return this.mapper.toPageDTO(await this.repository.list(query));
  }
}
