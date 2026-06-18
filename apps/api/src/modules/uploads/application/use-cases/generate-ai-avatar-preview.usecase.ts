import {
  AI_IMAGE_GENERATION_STEPS,
  AI_IMAGE_SEED_UPPER_BOUND,
} from '../../domain/constants/uploads.constants'
import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { AiImageGenerationServiceContract } from '../../domain/services/ai-image-generation.service.interface'
import type { RandomSeedServiceContract } from '../../domain/services/random-seed.service.interface'
import type { AiImagePreviewResult } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { UploadsMapperContract } from '../mappers/uploads.mapper'
import type { AiUploadPromptServiceContract } from '../services/ai-upload-prompt.service'

export class GenerateAiAvatarPreviewUseCase {
  constructor(
    private readonly aiImageGenerationService: AiImageGenerationServiceContract,
    private readonly aiUploadPromptService: AiUploadPromptServiceContract,
    private readonly randomSeedService: RandomSeedServiceContract,
    private readonly uploadsMapper: UploadsMapperContract,
  ) {}

  async execute(prompt: string): Promise<AiImagePreviewResult> {
    const cleanedPrompt = prompt.trim()

    if (!cleanedPrompt) {
      throw UploadsApplicationError.promptRequired()
    }

    try {
      const image = await this.aiImageGenerationService.generatePreviewImage({
        prompt: this.aiUploadPromptService.buildPrompt(
          'avatar',
          cleanedPrompt,
        ),
        steps: AI_IMAGE_GENERATION_STEPS,
        seed: this.randomSeedService.createSeed(
          AI_IMAGE_SEED_UPPER_BOUND,
        ),
      })

      return this.uploadsMapper.toAiImagePreviewResult(image.dataUrl)
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.aiImageGenerationFailed()
      }

      throw error
    }
  }
}
