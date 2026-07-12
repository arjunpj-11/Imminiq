import {
  AI_IMAGE_GENERATION_STEPS,
  AI_IMAGE_SEED_UPPER_BOUND,
} from '../../domain/uploads.constants'
import { UploadsDomainError } from '../../domain/uploads-domain.error'
import type { IAIImageGenerator } from '../../domain/services/ai-image-generation.interface'
import type { IRandomSeedGenerator } from '../../domain/services/random-seed.interface'
import type { IAIImagePreviewResultDTO } from '../uploads.dto'
import { UploadsApplicationError } from '../uploads-application.error'
import type { IAIUploadPromptBuilder } from '../services/ai-upload-prompt.service'

export interface IGenerateAIBannerPreviewUseCase {
  execute(prompt: string): Promise<IAIImagePreviewResultDTO>
}

export class GenerateAIBannerPreviewUseCase implements IGenerateAIBannerPreviewUseCase {
  constructor(
    private readonly _aiImageGenerator: IAIImageGenerator,
    private readonly _aiUploadPromptBuilder: IAIUploadPromptBuilder,
    private readonly _randomSeedGenerator: IRandomSeedGenerator,
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

      return { imageUrl: image.dataUrl }
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.aiImageGenerationFailed()
      }

      throw error
    }
  }
}
