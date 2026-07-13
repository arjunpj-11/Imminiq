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
  readonly statusCode: number;

  private constructor(statusCode: number, code: FriendsApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'FriendsApplicationError';
    this.statusCode = statusCode;
  }

  static userNotFound(
    message = 'User was not found or is not available for friend requests'
  ): FriendsApplicationError {
    return new FriendsApplicationError(404, 'FRIEND_USER_NOT_FOUND', message);
  }

  static cannotFriendSelf(): FriendsApplicationError {
    return new FriendsApplicationError(
      400,
      'CANNOT_FRIEND_SELF',
      'You cannot send a friend invite to yourself'
    );
  }

  static alreadyFriends(): FriendsApplicationError {
    return new FriendsApplicationError(
      409,
      'ALREADY_FRIENDS',
      'You are already friends with this user'
    );
  }

  static requestAlreadyPending(): FriendsApplicationError {
    return new FriendsApplicationError(
      409,
      'FRIEND_REQUEST_ALREADY_PENDING',
      'A friend invite is already pending for this user'
    );
  }

  static reverseRequestExists(): FriendsApplicationError {
    return new FriendsApplicationError(
      409,
      'REVERSE_FRIEND_REQUEST_EXISTS',
      'This user has already sent you a friend invite'
    );
  }

  static requestNotFound(): FriendsApplicationError {
    return new FriendsApplicationError(404, 'FRIEND_REQUEST_NOT_FOUND', 'Friend invite not found');
  }

  static requestForbidden(): FriendsApplicationError {
    return new FriendsApplicationError(
      403,
      'FRIEND_REQUEST_FORBIDDEN',
      'You cannot modify this friend invite'
    );
  }

  static requestNotPending(): FriendsApplicationError {
    return new FriendsApplicationError(
      409,
      'FRIEND_REQUEST_NOT_PENDING',
      'This friend invite is no longer pending'
    );
  }

  static friendshipNotFound(): FriendsApplicationError {
    return new FriendsApplicationError(404, 'FRIENDSHIP_NOT_FOUND', 'Friendship not found');
  }

  static operationFailed(): FriendsApplicationError {
    return new FriendsApplicationError(500, 'FRIENDS_OPERATION_FAILED', 'Friends operation failed');
  }
}

export const isFriendsApplicationError = (error: unknown): error is FriendsApplicationError =>
  error instanceof FriendsApplicationError;
