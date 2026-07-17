import type { ErrorKind } from '../../../shared/errors/error-kind';
import { UploadsDomainError } from '../domain/uploads-domain.error';

export type UploadsApplicationErrorCode =
  | 'AI_IMAGE_GENERATION_FAILED'
  | 'IMAGE_FILE_REQUIRED'
  | 'IMAGE_UPLOAD_FAILED'
  | 'PROFILE_IMAGE_UPDATE_FAILED'
  | 'PROMPT_REQUIRED'
  | 'USER_NOT_FOUND'
  | 'USER_PROFILE_UNAVAILABLE';

export class UploadsApplicationError extends UploadsDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: UploadsApplicationErrorCode, message: string) {
    super(code, message);
    this.kind = kind;
    this.name = 'UploadsApplicationError';
  }

  static aiImageGenerationFailed(): UploadsApplicationError {
    return new UploadsApplicationError(
      'dependency-failure',
      'AI_IMAGE_GENERATION_FAILED',
      'AI image generation failed'
    );
  }

  static imageFileRequired(): UploadsApplicationError {
    return new UploadsApplicationError('invalid-input', 'IMAGE_FILE_REQUIRED', 'Image file is required');
  }

  static imageUploadFailed(): UploadsApplicationError {
    return new UploadsApplicationError('internal', 'IMAGE_UPLOAD_FAILED', 'Image upload failed');
  }

  static profileImageUpdateFailed(): UploadsApplicationError {
    return new UploadsApplicationError(
      'internal',
      'PROFILE_IMAGE_UPDATE_FAILED',
      'Profile image update failed'
    );
  }

  static promptRequired(): UploadsApplicationError {
    return new UploadsApplicationError('invalid-input', 'PROMPT_REQUIRED', 'Prompt is required');
  }

  static userNotFound(): UploadsApplicationError {
    return new UploadsApplicationError('missing-resource', 'USER_NOT_FOUND', 'User not found');
  }

  static userProfileUnavailable(): UploadsApplicationError {
    return new UploadsApplicationError(
      'internal',
      'USER_PROFILE_UNAVAILABLE',
      'User profile is unavailable'
    );
  }
}

export const isUploadsApplicationError = (error: unknown): error is UploadsApplicationError =>
  error instanceof UploadsApplicationError;
