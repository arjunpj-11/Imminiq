import type {
  AiImagePreviewResult,
  RemoveAvatarResult,
  RemoveBannerResult,
  UploadProfileImageInput,
  UploadProfileImageResult,
} from './application/dtos/uploads.dto'
import {
  UploadsMapper,
  type UploadsMapperContract,
} from './application/mappers/uploads.mapper'
import {
  AiUploadPromptService,
  type AiUploadPromptServiceContract,
} from './application/services/ai-upload-prompt.service'
import {
  UploadUserProfileService,
  type UploadUserProfileServiceContract,
} from './application/services/upload-user-profile.service'
import { GenerateAiAvatarPreviewUseCase } from './application/use-cases/generate-ai-avatar-preview.usecase'
import { GenerateAiBannerPreviewUseCase } from './application/use-cases/generate-ai-banner-preview.usecase'
import { RemoveAvatarUseCase } from './application/use-cases/remove-avatar.usecase'
import { RemoveBannerUseCase } from './application/use-cases/remove-banner.usecase'
import { UploadProfileImageUseCase } from './application/use-cases/upload-profile-image.usecase'
import type { UploadsRepositoryContract } from './domain/repositories/uploads.repository.interface'
import type { AiImageGenerationServiceContract } from './domain/services/ai-image-generation.service.interface'
import type { ProfileImageStorageServiceContract } from './domain/services/profile-image-storage.service.interface'
import type { RandomSeedServiceContract } from './domain/services/random-seed.service.interface'
import { cloudflareAiImageGenerationGateway } from './infrastructure/gateways/cloudflare-ai-image-generation.gateway'
import { cloudinaryProfileImageStorageGateway } from './infrastructure/gateways/cloudinary-profile-image-storage.gateway'
import { mongoUploadsRepository } from './infrastructure/repositories/mongo-uploads.repository'
import { cryptoRandomSeedService } from './infrastructure/services/crypto-random-seed.service'
import { usersService } from '../users'

interface UploadsServiceDependencies {
  uploadsRepository: UploadsRepositoryContract
  profileImageStorageService: ProfileImageStorageServiceContract
  aiImageGenerationService: AiImageGenerationServiceContract
  randomSeedService: RandomSeedServiceContract
  uploadsMapper: UploadsMapperContract
  aiUploadPromptService: AiUploadPromptServiceContract
  uploadUserProfileService: UploadUserProfileServiceContract
}

export class UploadsService {
  private readonly uploadProfileImageUseCase: UploadProfileImageUseCase
  private readonly removeAvatarUseCase: RemoveAvatarUseCase
  private readonly removeBannerUseCase: RemoveBannerUseCase
  private readonly generateAiAvatarPreviewUseCase: GenerateAiAvatarPreviewUseCase
  private readonly generateAiBannerPreviewUseCase: GenerateAiBannerPreviewUseCase

  constructor(dependencies: UploadsServiceDependencies) {
    this.uploadProfileImageUseCase = new UploadProfileImageUseCase(
      dependencies.uploadUserProfileService,
      dependencies.profileImageStorageService,
      dependencies.uploadsRepository,
      dependencies.uploadsMapper,
    )

    this.removeAvatarUseCase = new RemoveAvatarUseCase(
      dependencies.uploadUserProfileService,
      dependencies.uploadsRepository,
      dependencies.uploadsMapper,
    )

    this.removeBannerUseCase = new RemoveBannerUseCase(
      dependencies.uploadUserProfileService,
      dependencies.uploadsRepository,
      dependencies.uploadsMapper,
    )

    this.generateAiAvatarPreviewUseCase =
      new GenerateAiAvatarPreviewUseCase(
        dependencies.aiImageGenerationService,
        dependencies.aiUploadPromptService,
        dependencies.randomSeedService,
        dependencies.uploadsMapper,
      )

    this.generateAiBannerPreviewUseCase =
      new GenerateAiBannerPreviewUseCase(
        dependencies.aiImageGenerationService,
        dependencies.aiUploadPromptService,
        dependencies.randomSeedService,
        dependencies.uploadsMapper,
      )
  }

  uploadProfileImage(
    input: UploadProfileImageInput,
  ): Promise<UploadProfileImageResult> {
    return this.uploadProfileImageUseCase.execute(input)
  }

  removeAvatar(userId: string): Promise<RemoveAvatarResult> {
    return this.removeAvatarUseCase.execute(userId)
  }

  removeBanner(userId: string): Promise<RemoveBannerResult> {
    return this.removeBannerUseCase.execute(userId)
  }

  generateAiAvatarPreview(prompt: string): Promise<AiImagePreviewResult> {
    return this.generateAiAvatarPreviewUseCase.execute(prompt)
  }

  generateAiBannerPreview(prompt: string): Promise<AiImagePreviewResult> {
    return this.generateAiBannerPreviewUseCase.execute(prompt)
  }
}

const uploadsRepository = mongoUploadsRepository
const profileImageStorageService = cloudinaryProfileImageStorageGateway
const aiImageGenerationService = cloudflareAiImageGenerationGateway
const randomSeedService = cryptoRandomSeedService
const uploadsMapper = new UploadsMapper()
const aiUploadPromptService = new AiUploadPromptService()
const uploadUserProfileService = new UploadUserProfileService(usersService)

export const uploadsService = new UploadsService({
  uploadsRepository,
  profileImageStorageService,
  aiImageGenerationService,
  randomSeedService,
  uploadsMapper,
  aiUploadPromptService,
  uploadUserProfileService,
})
