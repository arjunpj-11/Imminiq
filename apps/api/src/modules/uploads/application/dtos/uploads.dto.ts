import type { UploadedProfileImageFile } from '../../domain/value-objects/uploaded-profile-image-file.vo'
import type { ProfileUploadKind } from '../../domain/value-objects/profile-upload-kind.vo'

export interface UploadProfileImageInput {
  userId: string
  kind: ProfileUploadKind
  file?: UploadedProfileImageFile
}

export interface UploadProfileImageResult {
  uploadId: string
  fileUrl: string
  kind: ProfileUploadKind
}

export interface RemoveAvatarResult {
  avatarRemoved: true
  defaultAvatarApplied: true
}

export interface RemoveBannerResult {
  bannerRemoved: true
}

export interface AIImagePreviewResult {
  imageUrl: string
}

export interface GenerateAIImagePreviewInput {
  prompt: string
}

export interface UploadUserProfileContext {
  userId: string
  fullName: string
  profileId: string
}
