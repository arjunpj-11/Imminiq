import type { INotificationQueryRepository } from '../../domain';
import type {
  ListNotificationsPayloadDTO,
  ListNotificationsResponseDTO,
} from '../notifications.dto';
import type { INotificationsMapper } from '../notifications.mapper';

export interface IListNotificationsUseCase {
  execute(
    userId: string,
    payload: ListNotificationsPayloadDTO
  ): Promise<ListNotificationsResponseDTO>;
}
export class ListNotificationsUseCase implements IListNotificationsUseCase {
  constructor(
    private readonly _repository: INotificationQueryRepository,
    private readonly _mapper: INotificationsMapper
  ) {}
  async execute(userId: string, payload: ListNotificationsPayloadDTO) {
    const page = await this._repository.listNotifications({ userId, ...payload });
    return this._mapper.toListResponse({ ...page, ...payload });
  }
}
