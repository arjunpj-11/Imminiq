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
  private readonly useCases: UploadsComposition['useCases']

  constructor(composition: UploadsComposition) {
    this.useCases = composition.useCases
  }

  uploadProfileImage(
    input: UploadProfileImageInput
  ): Promise<UploadProfileImageResult> {
    return this.useCases.uploadProfileImage.execute(input)
  }

  removeAvatar(userId: string): Promise<RemoveAvatarResult> {
    return this.useCases.removeAvatar.execute(userId)
  }

  removeBanner(userId: string): Promise<RemoveBannerResult> {
    return this.useCases.removeBanner.execute(userId)
  }

  generateAiAvatarPreview(prompt: string): Promise<AiImagePreviewResult> {
    return this.useCases.generateAiAvatarPreview.execute(prompt)
  }

  generateAiBannerPreview(prompt: string): Promise<AiImagePreviewResult> {
    return this.useCases.generateAiBannerPreview.execute(prompt)
  }
}

export const uploadsService = new UploadsService(
  createUploadsComposition()
)