import type * as Application from '../index'
export type UploadsUseCases = {
  uploadProfileImage: Application.UploadProfileImageUseCase
  removeAvatar: Application.RemoveAvatarUseCase
  removeBanner: Application.RemoveBannerUseCase
  generateAIAvatarPreview: Application.GenerateAIAvatarPreviewUseCase
  generateAIBannerPreview: Application.GenerateAIBannerPreviewUseCase
}
