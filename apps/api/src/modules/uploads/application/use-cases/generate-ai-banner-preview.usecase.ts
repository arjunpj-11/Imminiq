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

export class GenerateAiBannerPreviewUseCase {
  constructor(
    private readonly _aiImageGenerationService: AiImageGenerationServiceContract,
    private readonly _aiUploadPromptService: AiUploadPromptServiceContract,
    private readonly _randomSeedService: RandomSeedServiceContract,
    private readonly _uploadsMapper: UploadsMapperContract,
  ) {}

  async execute(prompt: string): Promise<AiImagePreviewResult> {
    const cleanedPrompt = prompt.trim()

    if (!cleanedPrompt) {
      throw UploadsApplicationError.promptRequired()
    }

    try {
      const image = await this._aiImageGenerationService.generatePreviewImage({
        prompt: this._aiUploadPromptService.buildPrompt(
          'banner',
          cleanedPrompt,
        ),
        steps: AI_IMAGE_GENERATION_STEPS,
        seed: this._randomSeedService.createSeed(
          AI_IMAGE_SEED_UPPER_BOUND,
        ),
      })

      return this._uploadsMapper.toAiImagePreviewResult(image.dataUrl)
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.aiImageGenerationFailed()
      }

      throw error
    }
  }
}
