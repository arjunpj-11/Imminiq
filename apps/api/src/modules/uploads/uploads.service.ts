import { mongoUploadsRepository } from './infrastructure/repositories/mongo-uploads.repository'
import { cloudinaryProfileImageStorageGateway } from './infrastructure/gateways/cloudinary-profile-image-storage.gateway'
import { cloudflareAiImageGenerationGateway } from './infrastructure/gateways/cloudflare-ai-image-generation.gateway'
import { usersProfileGateway } from './infrastructure/gateways/users-profile.gateway'

import type {
  UploadProfileImageInput,
} from './domain/types/uploads.types'

import { UploadProfileImageUseCase } from './application/use-cases/upload-profile-image.usecase'
import { RemoveAvatarUseCase } from './application/use-cases/remove-avatar.usecase'
import { RemoveBannerUseCase } from './application/use-cases/remove-banner.usecase'
import { GenerateAiAvatarPreviewUseCase } from './application/use-cases/generate-ai-avatar-preview.usecase'
import { GenerateAiBannerPreviewUseCase } from './application/use-cases/generate-ai-banner-preview.usecase'

const uploadProfileImageUseCase =
  new UploadProfileImageUseCase(
    usersProfileGateway,
    cloudinaryProfileImageStorageGateway,
    mongoUploadsRepository
  )

const removeAvatarUseCase =
  new RemoveAvatarUseCase(
    usersProfileGateway,
    mongoUploadsRepository
  )

const removeBannerUseCase =
  new RemoveBannerUseCase(
    usersProfileGateway,
    mongoUploadsRepository
  )

const generateAiAvatarPreviewUseCase =
  new GenerateAiAvatarPreviewUseCase(
    cloudflareAiImageGenerationGateway
  )

const generateAiBannerPreviewUseCase =
  new GenerateAiBannerPreviewUseCase(
    cloudflareAiImageGenerationGateway
  )

export const uploadsService = {
  async uploadProfileImage(input: UploadProfileImageInput) {
    return uploadProfileImageUseCase.execute(input)
  },

  async removeAvatar(userId: string) {
    return removeAvatarUseCase.execute(userId)
  },

  async removeBanner(userId: string) {
    return removeBannerUseCase.execute(userId)
  },

  async generateAiAvatarPreview(prompt: string) {
    return generateAiAvatarPreviewUseCase.execute(prompt)
  },

  async generateAiBannerPreview(prompt: string) {
    return generateAiBannerPreviewUseCase.execute(prompt)
  },
}
