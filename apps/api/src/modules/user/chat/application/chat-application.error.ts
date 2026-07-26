import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { ChatDomainError } from '../domain/chat-domain.error';

export type ChatApplicationErrorCode =
  | 'INVALID_CHAT_PARTICIPANT'
  | 'CHAT_NOT_FRIENDS'
  | 'CHAT_PARTICIPANT_NOT_FOUND'
  | 'CHAT_CONVERSATION_NOT_FOUND'
  | 'EMPTY_CHAT_MESSAGE'
  | 'EMPTY_CODE_MESSAGE'
  | 'CHAT_FILE_REQUIRED'
  | 'CHAT_UPLOAD_FAILED'
  | 'CHAT_USER_BLOCKED'
  | 'CHAT_BLOCK_FAILED'
  | 'CHAT_MESSAGE_NOT_FOUND'
  | 'CHAT_TRACKER_NOT_SHAREABLE'
  | 'CHAT_PROFILE_NOT_SHAREABLE';

export class ChatApplicationError extends ChatDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: ChatApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'ChatApplicationError';
    this.kind = kind;
  }

  static invalidParticipant() {
    return new ChatApplicationError(
      'invalid-input',
      'INVALID_CHAT_PARTICIPANT',
      'You cannot start a chat with yourself'
    );
  }

  static friendsOnly() {
    return new ChatApplicationError(
      'forbidden',
      'CHAT_NOT_FRIENDS',
      'You can only message people in your friends list'
    );
  }

  static participantNotFound() {
    return new ChatApplicationError(
      'missing-resource',
      'CHAT_PARTICIPANT_NOT_FOUND',
      'Friend account could not be found'
    );
  }

  static conversationNotFound() {
    return new ChatApplicationError(
      'missing-resource',
      'CHAT_CONVERSATION_NOT_FOUND',
      'Conversation could not be found'
    );
  }

  static emptyMessage() {
    return new ChatApplicationError(
      'invalid-input',
      'EMPTY_CHAT_MESSAGE',
      'Write a message or attach a file'
    );
  }

  static emptyCode() {
    return new ChatApplicationError(
      'invalid-input',
      'EMPTY_CODE_MESSAGE',
      'Code messages cannot be empty'
    );
  }

  static fileRequired() {
    return new ChatApplicationError(
      'invalid-input',
      'CHAT_FILE_REQUIRED',
      'Choose a file to attach'
    );
  }

  static uploadFailed() {
    return new ChatApplicationError(
      'dependency-failure',
      'CHAT_UPLOAD_FAILED',
      'The attachment could not be uploaded'
    );
  }

  static userBlocked() {
    return new ChatApplicationError(
      'forbidden',
      'CHAT_USER_BLOCKED',
      'Messages and calls are unavailable while either person is blocked'
    );
  }

  static blockFailed() {
    return new ChatApplicationError(
      'dependency-failure',
      'CHAT_BLOCK_FAILED',
      'The user could not be blocked'
    );
  }

  static messageNotFound() {
    return new ChatApplicationError(
      'missing-resource',
      'CHAT_MESSAGE_NOT_FOUND',
      'The message could not be found'
    );
  }

  static trackerNotShareable() {
    return new ChatApplicationError(
      'forbidden',
      'CHAT_TRACKER_NOT_SHAREABLE',
      'This tracker is not available to share'
    );
  }

  static profileNotShareable() {
    return new ChatApplicationError(
      'forbidden',
      'CHAT_PROFILE_NOT_SHAREABLE',
      'This profile is not available to share'
    );
  }
}
