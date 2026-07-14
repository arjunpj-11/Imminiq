import type { AdminListQuery, AdminPage } from '../../../shared';
import type { IAdminMockTestsRepository } from '../../domain/repositories/admin-mock-tests.repository.interface';
import type { IAdminMockTestDTO } from '../admin-mock-tests.dto';
import type { IAdminMockTestsMapper } from '../admin-mock-tests.mapper';

export interface IListAdminMockTestsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<IAdminMockTestDTO>>;
}

export class ListAdminMockTestsUseCase implements IListAdminMockTestsUseCase {
  constructor(
    private readonly repository: IAdminMockTestsRepository,
    private readonly mapper: IAdminMockTestsMapper
  ) {}

  async execute(query: AdminListQuery): Promise<AdminPage<IAdminMockTestDTO>> {
    return this.mapper.toPageDTO(await this.repository.list(query));
  }
}
