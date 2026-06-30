import type {
  AiImagePreviewResult,
  RemoveAvatarResult,
  RemoveBannerResult,
  UploadProfileImageInput,
  UploadProfileImageResult,
} from './application/dtos/uploads.dto'
import {
  createUploadsComposition,
  type UploadsComposition,
} from './uploads.factory'

export class UploadsService {
  private readonly _useCases: UploadsComposition['useCases']

  constructor(composition: UploadsComposition) {
    this._useCases = composition.useCases
  }

  uploadProfileImage(
    input: UploadProfileImageInput
  ): Promise<UploadProfileImageResult> {
    return this._useCases.uploadProfileImage.execute(input)
  }

  removeAvatar(userId: string): Promise<RemoveAvatarResult> {
    return this._useCases.removeAvatar.execute(userId)
  }

  removeBanner(userId: string): Promise<RemoveBannerResult> {
    return this._useCases.removeBanner.execute(userId)
  }

  generateAiAvatarPreview(prompt: string): Promise<AiImagePreviewResult> {
    return this._useCases.generateAiAvatarPreview.execute(prompt)
  }

  generateAiBannerPreview(prompt: string): Promise<AiImagePreviewResult> {
    return this._useCases.generateAiBannerPreview.execute(prompt)
  }
}

export const uploadsService = new UploadsService(
  createUploadsComposition()
)