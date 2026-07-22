import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { AdminTrackerDetailDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IGetAdminTrackerDetailUseCase {
  execute(id: string): Promise<AdminTrackerDetailDTO>;
}

export class GetAdminTrackerDetailUseCase implements IGetAdminTrackerDetailUseCase {
  constructor(
    private readonly _repository: Pick<IAdminTrackersRepository, 'getDetail'>,
    private readonly _mapper: IAdminTrackersMapper
  ) {}

  async execute(id: string) {
    const result = await this._repository.getDetail(id);
    if (!result) throw AdminTrackersApplicationError.trackerNotFound();
    return this._mapper.toDetailDTO(result);
  }
}
