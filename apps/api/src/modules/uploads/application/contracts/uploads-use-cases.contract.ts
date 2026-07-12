import type * as Application from '../index'
export type UploadsUseCases = {
  uploadProfileImage: Application.IUploadProfileImageUseCase
  removeAvatar: Application.IRemoveAvatarUseCase
  removeBanner: Application.IRemoveBannerUseCase
  generateAIAvatarPreview: Application.IGenerateAIAvatarPreviewUseCase
  generateAIBannerPreview: Application.IGenerateAIBannerPreviewUseCase
}
