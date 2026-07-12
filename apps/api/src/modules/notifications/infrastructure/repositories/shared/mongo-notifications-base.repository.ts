import { MongoNotificationsErrorMapper } from './mongo-notifications-error.mapper'

export abstract class MongoNotificationsBaseRepository {
  protected async execute<T>(fallback: string, operation: () => Promise<T>): Promise<T> {
    try { return await operation() } catch (error) { throw MongoNotificationsErrorMapper.map(error, fallback) }
  }
}
