import { ApiError } from '../../../../shared/utils/ApiError'
import type { AiImageGenerationServiceContract } from '../../domain/services/ai-image-generation.service.interface'
import type { AiImagePreviewResult } from '../../domain/types/uploads.types'

export class GenerateAiAvatarPreviewUseCase {
  constructor(
    private readonly aiImageGenerationService: AiImageGenerationServiceContract
  ) {}

  async execute(prompt: string): Promise<AiImagePreviewResult> {
    const cleanedPrompt = prompt.trim()

    if (!cleanedPrompt) {
      throw new ApiError(400, 'Prompt is required')
    }

    const avatarOptimizedPrompt = `
Create a clean, high-quality profile avatar.
Subject instructions: ${cleanedPrompt}.
Style: centered portrait, clear face or character focus, polished digital illustration,
professional profile picture composition, balanced lighting, simple background,
no text, no watermark, no logo, square-friendly framing.
`.trim()

    const image = await this.aiImageGenerationService.generatePreviewImage({
      prompt: avatarOptimizedPrompt,
      steps: 4,
      seed: Math.floor(Math.random() * 1_000_000),
    })

    return {
      imageUrl: image.dataUrl,
    }
  }
}
