import type { UploadedProfileImageEntity } from '../../domain/entities/uploaded-profile-image.entity'
import type {
  AIImagePreviewResult,
  RemoveAvatarResult,
  RemoveBannerResult,
  UploadProfileImageResult,
} from '../dtos/uploads.dto'

export interface UploadsMapperContract {
  toUploadProfileImageResult(
    upload: UploadedProfileImageEntity,
  ): UploadProfileImageResult
  toAvatarRemovedResult(): RemoveAvatarResult
  toBannerRemovedResult(): RemoveBannerResult
  toAIImagePreviewResult(imageUrl: string): AIImagePreviewResult
}

export class UploadsMapper implements UploadsMapperContract {
  toUploadProfileImageResult(
    upload: UploadedProfileImageEntity,
  ): UploadProfileImageResult {
    return {
      uploadId: upload.id,
      fileUrl: upload.fileUrl,
      kind: upload.kind,
    }
  }

  toAvatarRemovedResult(): RemoveAvatarResult {
    return {
      avatarRemoved: true,
      defaultAvatarApplied: true,
    }
  }

  toBannerRemovedResult(): RemoveBannerResult {
    return {
      bannerRemoved: true,
    }
  }

  toAIImagePreviewResult(imageUrl: string): AIImagePreviewResult {
    return { imageUrl }
  }
}
