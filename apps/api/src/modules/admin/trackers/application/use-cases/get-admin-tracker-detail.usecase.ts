import type { AdminTrackerDetail } from '../../domain/entities/admin-tracker.entity';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';

export interface IGetAdminTrackerDetailUseCase {
  execute(id: string): Promise<AdminTrackerDetail>;
}

export class GetAdminTrackerDetailUseCase implements IGetAdminTrackerDetailUseCase {
  constructor(private readonly repository: IAdminTrackersRepository) {}

  async execute(id: string) {
    const result = await this.repository.getDetail(id);
    if (!result) throw AdminTrackersApplicationError.trackerNotFound();
    return result;
  }
}
