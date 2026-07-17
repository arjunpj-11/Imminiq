import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { FriendsDomainError } from '../domain/friends-domain.error';

export type FriendsApplicationErrorCode =
  | 'FRIEND_USER_NOT_FOUND'
  | 'CANNOT_FRIEND_SELF'
  | 'ALREADY_FRIENDS'
  | 'FRIEND_REQUEST_ALREADY_PENDING'
  | 'REVERSE_FRIEND_REQUEST_EXISTS'
  | 'FRIEND_REQUEST_NOT_FOUND'
  | 'FRIEND_REQUEST_FORBIDDEN'
  | 'FRIEND_REQUEST_NOT_PENDING'
  | 'FRIENDSHIP_NOT_FOUND'
  | 'FRIENDS_OPERATION_FAILED';

export class FriendsApplicationError extends FriendsDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: FriendsApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'FriendsApplicationError';
    this.kind = kind;
  }

  static userNotFound(
    message = 'User was not found or is not available for friend requests'
  ): FriendsApplicationError {
    return new FriendsApplicationError('missing-resource', 'FRIEND_USER_NOT_FOUND', message);
  }

  static cannotFriendSelf(): FriendsApplicationError {
    return new FriendsApplicationError(
      'invalid-input',
      'CANNOT_FRIEND_SELF',
      'You cannot send a friend invite to yourself'
    );
  }

  static alreadyFriends(): FriendsApplicationError {
    return new FriendsApplicationError(
      'conflict',
      'ALREADY_FRIENDS',
      'You are already friends with this user'
    );
  }

  static requestAlreadyPending(): FriendsApplicationError {
    return new FriendsApplicationError(
      'conflict',
      'FRIEND_REQUEST_ALREADY_PENDING',
      'A friend invite is already pending for this user'
    );
  }

  static reverseRequestExists(): FriendsApplicationError {
    return new FriendsApplicationError(
      'conflict',
      'REVERSE_FRIEND_REQUEST_EXISTS',
      'This user has already sent you a friend invite'
    );
  }

  static requestNotFound(): FriendsApplicationError {
    return new FriendsApplicationError('missing-resource', 'FRIEND_REQUEST_NOT_FOUND', 'Friend invite not found');
  }

  static requestForbidden(): FriendsApplicationError {
    return new FriendsApplicationError(
      'forbidden',
      'FRIEND_REQUEST_FORBIDDEN',
      'You cannot modify this friend invite'
    );
  }

  static requestNotPending(): FriendsApplicationError {
    return new FriendsApplicationError(
      'conflict',
      'FRIEND_REQUEST_NOT_PENDING',
      'This friend invite is no longer pending'
    );
  }

  static friendshipNotFound(): FriendsApplicationError {
    return new FriendsApplicationError('missing-resource', 'FRIENDSHIP_NOT_FOUND', 'Friendship not found');
  }

  static operationFailed(): FriendsApplicationError {
    return new FriendsApplicationError('internal', 'FRIENDS_OPERATION_FAILED', 'Friends operation failed');
  }
}

export const isFriendsApplicationError = (error: unknown): error is FriendsApplicationError =>
  error instanceof FriendsApplicationError;
