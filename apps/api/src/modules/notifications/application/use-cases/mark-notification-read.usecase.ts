import type { INotificationCommandRepository } from '../../domain'
import type { MarkNotificationReadResponseDTO } from '../notifications.dto'
import { NotificationApplicationError } from '../notifications-application.error'

export interface IMarkNotificationReadUseCase { execute(userId: string, notificationId: string): Promise<MarkNotificationReadResponseDTO> }
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
  constructor(private readonly _repository: INotificationCommandRepository) {}
  async execute(userId: string, notificationId: string) {
    const updated = await this._repository.markNotificationRead(userId, notificationId)
    if (!updated) throw NotificationApplicationError.notFound()
    return { updated }
  }
}
