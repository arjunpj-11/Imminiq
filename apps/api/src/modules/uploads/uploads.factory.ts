import type { UploadsUseCases } from './application/contracts/uploads-use-cases.contract'
import {
  UploadsMapper,
} from './application/mappers/uploads.mapper'
import {
  AIUploadPromptBuilder,
} from './application/services/ai-upload-prompt.service'
import {
  UploadUserProfileReader,
} from './application/services/upload-user-profile.service'
import { GenerateAIAvatarPreviewUseCase } from './application/use-cases/generate-ai-avatar-preview.usecase'
import { GenerateAIBannerPreviewUseCase } from './application/use-cases/generate-ai-banner-preview.usecase'
import { RemoveAvatarUseCase } from './application/use-cases/remove-avatar.usecase'
import { RemoveBannerUseCase } from './application/use-cases/remove-banner.usecase'
import { UploadProfileImageUseCase } from './application/use-cases/upload-profile-image.usecase'
import { cloudflareAIImageGenerationGateway } from './infrastructure/gateways/cloudflare-ai-image-generation.gateway'
import { cloudinaryProfileImageStorageGateway } from './infrastructure/gateways/cloudinary-profile-image-storage.gateway'
import { mongoUploadsRepository } from './infrastructure/repositories/mongo-uploads.repository'
import { cryptoRandomSeedGenerator } from './infrastructure/services/crypto-random-seed.service'
import type { IGetMeUseCase } from '../users'


export type UploadsComposition = {
  useCases: UploadsUseCases
}

export const createUploadsComposition = (
  usersProfileReader: IGetMeUseCase,
): UploadsComposition => {
  const uploadsRepository = mongoUploadsRepository
  const profileImageStorage = cloudinaryProfileImageStorageGateway
  const aiImageGenerator = cloudflareAIImageGenerationGateway
  const randomSeedGenerator = cryptoRandomSeedGenerator
  const uploadsMapper = new UploadsMapper()
  const aiUploadPromptBuilder = new AIUploadPromptBuilder()
  const userProfileReader = new UploadUserProfileReader(usersProfileReader)

  return {
    useCases: {
      uploadProfileImage: new UploadProfileImageUseCase(
        userProfileReader,
        profileImageStorage,
        uploadsRepository,
        uploadsMapper
      ),

      removeAvatar: new RemoveAvatarUseCase(
        userProfileReader,
        uploadsRepository
      ),

      removeBanner: new RemoveBannerUseCase(
        userProfileReader,
        uploadsRepository
      ),

      generateAIAvatarPreview: new GenerateAIAvatarPreviewUseCase(
        aiImageGenerator,
        aiUploadPromptBuilder,
        randomSeedGenerator
      ),

      generateAIBannerPreview: new GenerateAIBannerPreviewUseCase(
        aiImageGenerator,
        aiUploadPromptBuilder,
        randomSeedGenerator
      ),
    },
  }
}
