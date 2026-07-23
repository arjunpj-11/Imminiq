import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { CallDomainError } from '../domain/call-domain.error';

export type CallApplicationErrorCode =
  | 'INVALID_CALL_PARTICIPANT'
  | 'CALL_NOT_FRIENDS'
  | 'CALL_PARTICIPANT_NOT_FOUND'
  | 'CALL_NOT_FOUND'
  | 'CALL_FORBIDDEN'
  | 'CALL_INVALID_STATE'
  | 'CALL_USER_BUSY';

export class CallApplicationError extends CallDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: CallApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'CallApplicationError';
    this.kind = kind;
  }

  static invalidParticipant() {
    return new CallApplicationError(
      'invalid-input',
      'INVALID_CALL_PARTICIPANT',
      'You cannot call yourself'
    );
  }

  static friendsOnly() {
    return new CallApplicationError(
      'forbidden',
      'CALL_NOT_FRIENDS',
      'You can only call people in your friends list'
    );
  }

  static participantNotFound() {
    return new CallApplicationError(
      'missing-resource',
      'CALL_PARTICIPANT_NOT_FOUND',
      'Call participant could not be found'
    );
  }

  static notFound() {
    return new CallApplicationError(
      'missing-resource',
      'CALL_NOT_FOUND',
      'Call could not be found'
    );
  }

  static forbidden() {
    return new CallApplicationError(
      'forbidden',
      'CALL_FORBIDDEN',
      'You are not allowed to manage this call'
    );
  }

  static invalidState(message = 'The call is no longer in the expected state') {
    return new CallApplicationError('conflict', 'CALL_INVALID_STATE', message);
  }

  static busy() {
    return new CallApplicationError(
      'conflict',
      'CALL_USER_BUSY',
      'One of you is already in another call'
    );
  }
}
