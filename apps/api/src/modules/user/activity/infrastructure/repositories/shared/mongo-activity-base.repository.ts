import { ActivityDomainError } from '../../../domain/activity-domain.error';
import type { ActivityMongoErrorMapper } from './mongo-activity-error.mapper';

export abstract class MongoActivityBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ActivityMongoErrorMapper
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ActivityDomainError) {
        throw error;
      }

      const mappedError = mapError?.(error);

      if (mappedError) {
        throw mappedError;
      }

      this.logRepositoryError(code, message, error);

      throw new ActivityDomainError(code, message);
    }
  }

  private logRepositoryError(code: string, message: string, error: unknown): void {
    console.error('Activity repository operation failed', {
      code,
      message,
      originalError: this.describeError(error),
    });
  }

  private describeError(error: unknown) {
    if (!(error instanceof Error)) {
      return error;
    }

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
}
