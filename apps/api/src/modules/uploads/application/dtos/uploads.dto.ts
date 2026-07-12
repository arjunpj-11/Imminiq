import type { UploadedProfileImageFile } from '../../domain/value-objects/uploaded-profile-image-file.vo'
import type { ProfileUploadKind } from '../../domain/value-objects/profile-upload-kind.vo'

export interface IUploadProfileImageInputDTO {
  userId: string
  kind: ProfileUploadKind
  file?: UploadedProfileImageFile
}

export interface IUploadProfileImageResultDTO {
  uploadId: string
  fileUrl: string
  kind: ProfileUploadKind
}

export interface IRemoveAvatarResultDTO {
  avatarRemoved: true
  defaultAvatarApplied: true
}

export interface IRemoveBannerResultDTO {
  bannerRemoved: true
}

export interface IAIImagePreviewResultDTO {
  imageUrl: string
}

export interface IGenerateAIImagePreviewInputDTO {
  prompt: string
}

export interface IUploadUserProfileContextDTO {
  userId: string
  fullName: string
  profileId: string
}
