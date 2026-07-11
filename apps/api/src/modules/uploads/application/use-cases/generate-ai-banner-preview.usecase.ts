import {
  AI_IMAGE_GENERATION_STEPS,
  AI_IMAGE_SEED_UPPER_BOUND,
} from '../../domain/constants/uploads.constants'
import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { AIImageGeneratorContract } from '../../domain/services/ai-image-generation.interface'
import type { RandomSeedGeneratorContract } from '../../domain/services/random-seed.interface'
import type { AIImagePreviewResult } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { UploadsMapperContract } from '../mappers/uploads.mapper'
import type { AIUploadPromptBuilderContract } from '../services/ai-upload-prompt.service'

export class GenerateAIBannerPreviewUseCase {
  constructor(
    private readonly _aiImageGenerator: AIImageGeneratorContract,
    private readonly _aiUploadPromptBuilder: AIUploadPromptBuilderContract,
    private readonly _randomSeedGenerator: RandomSeedGeneratorContract,
    private readonly _uploadsMapper: UploadsMapperContract,
  ) {}

  async execute(prompt: string): Promise<AIImagePreviewResult> {
    const cleanedPrompt = prompt.trim()

    if (!cleanedPrompt) {
      throw UploadsApplicationError.promptRequired()
    }

    try {
      const image = await this._aiImageGenerator.generatePreviewImage({
        prompt: this._aiUploadPromptBuilder.buildPrompt(
          'banner',
          cleanedPrompt,
        ),
        steps: AI_IMAGE_GENERATION_STEPS,
        seed: this._randomSeedGenerator.createSeed(
          AI_IMAGE_SEED_UPPER_BOUND,
        ),
      })

      return this._uploadsMapper.toAIImagePreviewResult(image.dataUrl)
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.aiImageGenerationFailed()
      }

      throw error
    }
  }
}
