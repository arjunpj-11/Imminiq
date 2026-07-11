import type { UploadedProfileImageEntity } from '../../domain/entities/uploaded-profile-image.entity'
import type {
  IAIImagePreviewResultDTO,
  IRemoveAvatarResultDTO,
  IRemoveBannerResultDTO,
  IUploadProfileImageResultDTO,
} from '../dtos/uploads.dto'

export interface IUploadsMapper {
  toUploadProfileImageResult(
    upload: UploadedProfileImageEntity,
  ): IUploadProfileImageResultDTO
  toAvatarRemovedResult(): IRemoveAvatarResultDTO
  toBannerRemovedResult(): IRemoveBannerResultDTO
  toAIImagePreviewResult(imageUrl: string): IAIImagePreviewResultDTO
}

export class UploadsMapper implements IUploadsMapper {
  toUploadProfileImageResult(
    upload: UploadedProfileImageEntity,
  ): IUploadProfileImageResultDTO {
    return {
      uploadId: upload.id,
      fileUrl: upload.fileUrl,
      kind: upload.kind,
    }
  }

  toAvatarRemovedResult(): IRemoveAvatarResultDTO {
    return {
      avatarRemoved: true,
      defaultAvatarApplied: true,
    }
  }

  toBannerRemovedResult(): IRemoveBannerResultDTO {
    return {
      bannerRemoved: true,
    }
  }

  toAIImagePreviewResult(imageUrl: string): IAIImagePreviewResultDTO {
    return { imageUrl }
  }
}
