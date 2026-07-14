import type { IAdminDashboardRepository } from '../../domain/repositories/admin-dashboard.repository.interface';
import type { AdminDashboardDTO } from '../admin-dashboard.dto';
import type { IAdminDashboardMapper } from '../admin-dashboard.mapper';

export interface IGetAdminDashboardUseCase {
  execute(): Promise<AdminDashboardDTO>;
}

export class GetAdminDashboardUseCase implements IGetAdminDashboardUseCase {
  constructor(
    private readonly _repository: IAdminDashboardRepository,
    private readonly _mapper: IAdminDashboardMapper
  ) {}

  async execute(): Promise<AdminDashboardDTO> {
    return this._mapper.toDTO(await this._repository.getOverview());
  }
}
