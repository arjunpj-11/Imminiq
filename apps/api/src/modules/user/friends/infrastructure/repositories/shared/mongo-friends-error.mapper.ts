import { FriendsDomainError } from '../../../domain/friends-domain.error';
import type { MongoDuplicateKeyError } from './mongo-friends.types';

export type FriendsMongoErrorMapper = (error: unknown) => FriendsDomainError | null;

export class MongoFriendsErrorMapper {
  static mapDuplicateRelationshipError(error: unknown): FriendsDomainError | null {
    /*
     * Do not use `this.isDuplicateKeyError()` here.
     *
     * This method is passed as a standalone callback to the base
     * repository, so `this` will be undefined when it is invoked.
     */
    if (!MongoFriendsErrorMapper.isDuplicateKeyError(error)) {
      return null;
    }

    const duplicateKeys = {
      ...error.keyPattern,
      ...error.keyValue,
    };

    if ('pairKey' in duplicateKeys) {
      return new FriendsDomainError(
        'FRIEND_REQUEST_CONFLICT',
        'A pending friend request already exists for this user pair'
      );
    }

    if ('userId' in duplicateKeys || 'friendId' in duplicateKeys) {
      return new FriendsDomainError('FRIENDSHIP_CONFLICT', 'Friendship already exists');
    }

    return new FriendsDomainError('FRIENDS_DUPLICATE_RECORD', 'Friends record already exists');
  }

  private static isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    );
  }
}
