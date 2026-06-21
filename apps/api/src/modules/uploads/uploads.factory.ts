import {
  UploadsMapper,
} from './application/mappers/uploads.mapper'
import {
  AiUploadPromptService,
} from './application/services/ai-upload-prompt.service'
import {
  UploadUserProfileService,
} from './application/services/upload-user-profile.service'
import { GenerateAiAvatarPreviewUseCase } from './application/use-cases/generate-ai-avatar-preview.usecase'
import { GenerateAiBannerPreviewUseCase } from './application/use-cases/generate-ai-banner-preview.usecase'
import { RemoveAvatarUseCase } from './application/use-cases/remove-avatar.usecase'
import { RemoveBannerUseCase } from './application/use-cases/remove-banner.usecase'
import { UploadProfileImageUseCase } from './application/use-cases/upload-profile-image.usecase'
import { cloudflareAiImageGenerationGateway } from './infrastructure/gateways/cloudflare-ai-image-generation.gateway'
import { cloudinaryProfileImageStorageGateway } from './infrastructure/gateways/cloudinary-profile-image-storage.gateway'
import { mongoUploadsRepository } from './infrastructure/repositories/mongo-uploads.repository'
import { cryptoRandomSeedService } from './infrastructure/services/crypto-random-seed.service'
import { usersService } from '../users'

export type UploadsUseCases = {
  uploadProfileImage: UploadProfileImageUseCase
  removeAvatar: RemoveAvatarUseCase
  removeBanner: RemoveBannerUseCase
  generateAiAvatarPreview: GenerateAiAvatarPreviewUseCase
  generateAiBannerPreview: GenerateAiBannerPreviewUseCase
}

export type UploadsComposition = {
  useCases: UploadsUseCases
}

export const createUploadsComposition = (): UploadsComposition => {
  const uploadsRepository = mongoUploadsRepository
  const profileImageStorageService = cloudinaryProfileImageStorageGateway
  const aiImageGenerationService = cloudflareAiImageGenerationGateway
  const randomSeedService = cryptoRandomSeedService
  const uploadsMapper = new UploadsMapper()
  const aiUploadPromptService = new AiUploadPromptService()
  const uploadUserProfileService = new UploadUserProfileService(usersService)

  return {
    useCases: {
      uploadProfileImage: new UploadProfileImageUseCase(
        uploadUserProfileService,
        profileImageStorageService,
        uploadsRepository,
        uploadsMapper
      ),

      removeAvatar: new RemoveAvatarUseCase(
        uploadUserProfileService,
        uploadsRepository,
        uploadsMapper
      ),

      removeBanner: new RemoveBannerUseCase(
        uploadUserProfileService,
        uploadsRepository,
        uploadsMapper
      ),

      generateAiAvatarPreview: new GenerateAiAvatarPreviewUseCase(
        aiImageGenerationService,
        aiUploadPromptService,
        randomSeedService,
        uploadsMapper
      ),

      generateAiBannerPreview: new GenerateAiBannerPreviewUseCase(
        aiImageGenerationService,
        aiUploadPromptService,
        randomSeedService,
        uploadsMapper
      ),
    },
  }
}