import type { INotificationCommandRepository } from '../../domain'
import type { MarkAllNotificationsReadResponseDTO } from '../notifications.dto'

export interface IMarkAllNotificationsReadUseCase { execute(userId: string): Promise<MarkAllNotificationsReadResponseDTO> }
export class MarkAllNotificationsReadUseCase implements IMarkAllNotificationsReadUseCase {
  constructor(private readonly _repository: INotificationCommandRepository) {}
  async execute(userId: string) { return { updated: await this._repository.markAllNotificationsRead(userId) } }
}
