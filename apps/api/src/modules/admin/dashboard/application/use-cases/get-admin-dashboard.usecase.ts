import type { IAdminDashboardRepository } from '../../domain/repositories/admin-dashboard.repository.interface';
import type { AdminDashboardDTO } from '../admin-dashboard.dto';
import type { IAdminDashboardMapper } from '../admin-dashboard.mapper';

export interface IGetAdminDashboardUseCase {
  execute(role: 'moderator' | 'admin' | 'superadmin'): Promise<AdminDashboardDTO>;
}

export class GetAdminDashboardUseCase implements IGetAdminDashboardUseCase {
  constructor(
    private readonly _repository: IAdminDashboardRepository,
    private readonly _mapper: IAdminDashboardMapper
  ) {}

  async execute(role: 'moderator' | 'admin' | 'superadmin'): Promise<AdminDashboardDTO> {
    const dto = this._mapper.toDTO(await this._repository.getOverview());
    if (role !== 'moderator') return dto;

    return {
      ...dto,
      accessScope: 'moderation',
      metrics: {
        ...dto.metrics,
        totalUsers: 0,
        verifiedUsers: 0,
        unverifiedUsers: 0,
        activeToday: 0,
        blockedUsers: 0,
        suspendedUsers: 0,
      },
      recentActivity: dto.recentActivity.filter((item) =>
        ['mock-test', 'tracker', 'support'].some((scope) => item.module.includes(scope))
      ),
    };
  }
}
