import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { IAdminTrackerDetailDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IGetAdminTrackerDetailUseCase {
  execute(id: string): Promise<IAdminTrackerDetailDTO>;
}

export class GetAdminTrackerDetailUseCase implements IGetAdminTrackerDetailUseCase {
  constructor(
    private readonly repository: IAdminTrackersRepository,
    private readonly mapper: IAdminTrackersMapper
  ) {}

  async execute(id: string) {
    const result = await this.repository.getDetail(id);
    if (!result) throw AdminTrackersApplicationError.trackerNotFound();
    return this.mapper.toDetailDTO(result);
  }
}
