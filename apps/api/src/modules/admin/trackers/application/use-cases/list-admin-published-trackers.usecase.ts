import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import type { AdminPublishedTracker } from '../../domain/entities/admin-tracker.entity';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';

export interface IListAdminPublishedTrackersUseCase {
  execute(query: AdminListQuery, actor: AdminActor): Promise<AdminPage<AdminPublishedTracker>>;
}

export class ListAdminPublishedTrackersUseCase implements IListAdminPublishedTrackersUseCase {
  constructor(private readonly repository: IAdminTrackersRepository) {}

  execute(query: AdminListQuery, actor: AdminActor) {
    return this.repository.listPublished(query, actor);
  }
}
