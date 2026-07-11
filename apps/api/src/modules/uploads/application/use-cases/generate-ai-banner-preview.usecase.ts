import {
  AI_IMAGE_GENERATION_STEPS,
  AI_IMAGE_SEED_UPPER_BOUND,
} from '../../domain/constants/uploads.constants'
import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { IAIImageGenerator } from '../../domain/services/ai-image-generation.interface'
import type { IRandomSeedGenerator } from '../../domain/services/random-seed.interface'
import type { IAIImagePreviewResultDTO } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { IUploadsMapper } from '../mappers/uploads.mapper'
import type { IAIUploadPromptBuilder } from '../services/ai-upload-prompt.service'

export class GenerateAIBannerPreviewUseCase {
  constructor(
    private readonly _aiImageGenerator: IAIImageGenerator,
    private readonly _aiUploadPromptBuilder: IAIUploadPromptBuilder,
    private readonly _randomSeedGenerator: IRandomSeedGenerator,
    private readonly _uploadsMapper: IUploadsMapper,
  ) {}

  async execute(prompt: string): Promise<IAIImagePreviewResultDTO> {
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
