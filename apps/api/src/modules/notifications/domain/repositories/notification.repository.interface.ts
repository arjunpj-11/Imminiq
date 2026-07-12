import type { INotificationCommandRepository } from './notification-command.repository.interface'
import type { INotificationQueryRepository } from './notification-query.repository.interface'

export interface INotificationRepository extends INotificationQueryRepository, INotificationCommandRepository {}
