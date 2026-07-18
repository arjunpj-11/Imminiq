import type { AdminListQuery, AdminPage } from '../../../../../shared/admin';
import type { AdminTrackerReport } from '../../domain/entities/admin-tracker.entity';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';

export interface IListAdminTrackerReportsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminTrackerReport>>;
}

export class ListAdminTrackerReportsUseCase implements IListAdminTrackerReportsUseCase {
  constructor(private readonly repository: IAdminTrackersRepository) {}
  execute(query: AdminListQuery) {
    return this.repository.listReports(query);
  }
}
