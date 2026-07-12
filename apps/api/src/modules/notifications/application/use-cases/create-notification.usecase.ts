import type { INotificationCommandRepository } from '../../domain'
import type { CreateNotificationPayloadDTO } from '../notifications.dto'
import { NotificationApplicationError } from '../notifications-application.error'

export interface ICreateNotificationUseCase { execute(payload: CreateNotificationPayloadDTO): Promise<void> }
export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(private readonly _repository: INotificationCommandRepository) {}
  async execute(payload: CreateNotificationPayloadDTO) {
    if (!payload.message.trim()) throw NotificationApplicationError.invalid('Notification message is required')
    await this._repository.createNotification({ ...payload, message: payload.message.trim() })
  }
}
