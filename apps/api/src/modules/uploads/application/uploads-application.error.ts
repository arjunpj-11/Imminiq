import { UploadsDomainError } from '../domain/uploads-domain.error'

export type UploadsApplicationErrorCode =
  | 'AI_IMAGE_GENERATION_FAILED'
  | 'IMAGE_FILE_REQUIRED'
  | 'IMAGE_UPLOAD_FAILED'
  | 'PROFILE_IMAGE_UPDATE_FAILED'
  | 'PROMPT_REQUIRED'
  | 'USER_NOT_FOUND'
  | 'USER_PROFILE_UNAVAILABLE'

export class UploadsApplicationError extends UploadsDomainError {
  readonly statusCode: number

  private constructor(
    statusCode: number,
    code: UploadsApplicationErrorCode,
    message: string,
  ) {
    super(code, message)
    this.statusCode = statusCode
    this.name = 'UploadsApplicationError'
  }

  static aiImageGenerationFailed(): UploadsApplicationError {
    return new UploadsApplicationError(
      502,
      'AI_IMAGE_GENERATION_FAILED',
      'AI image generation failed',
    )
  }

  static imageFileRequired(): UploadsApplicationError {
    return new UploadsApplicationError(
      400,
      'IMAGE_FILE_REQUIRED',
      'Image file is required',
    )
  }

  static imageUploadFailed(): UploadsApplicationError {
    return new UploadsApplicationError(
      500,
      'IMAGE_UPLOAD_FAILED',
      'Image upload failed',
    )
  }


  static profileImageUpdateFailed(): UploadsApplicationError {
    return new UploadsApplicationError(
      500,
      'PROFILE_IMAGE_UPDATE_FAILED',
      'Profile image update failed',
    )
  }

  static promptRequired(): UploadsApplicationError {
    return new UploadsApplicationError(
      400,
      'PROMPT_REQUIRED',
      'Prompt is required',
    )
  }

  static userNotFound(): UploadsApplicationError {
    return new UploadsApplicationError(
      404,
      'USER_NOT_FOUND',
      'User not found',
    )
  }

  static userProfileUnavailable(): UploadsApplicationError {
    return new UploadsApplicationError(
      500,
      'USER_PROFILE_UNAVAILABLE',
      'User profile is unavailable',
    )
  }
}

export const isUploadsApplicationError = (
  error: unknown,
): error is UploadsApplicationError => error instanceof UploadsApplicationError
