import { FriendsDomainError } from "../../../domain/errors/friends-domain.error";
import type { FriendsMongoErrorMapper } from "./mongo-friends-error.mapper";

export abstract class MongoFriendsBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: FriendsMongoErrorMapper,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof FriendsDomainError) {
        throw error;
      }

      const mappedError = mapError?.(error);

      if (mappedError) {
        throw mappedError;
      }

      this.logRepositoryError(code, message, error);

      throw new FriendsDomainError(code, message);
    }
  }

  private logRepositoryError(
    code: string,
    message: string,
    error: unknown,
  ): void {
    const originalError =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    console.error("Friends repository operation failed", {
      code,
      message,
      originalError,
    });
  }
}
