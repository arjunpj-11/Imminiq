import { ApiError } from '../../../../shared/utils/ApiError'
import type { AiImageGenerationServiceContract } from '../../domain/services/ai-image-generation.service.interface'
import type { AiImagePreviewResult } from '../../domain/types/uploads.types'

export class GenerateAiBannerPreviewUseCase {
  constructor(
    private readonly aiImageGenerationService: AiImageGenerationServiceContract
  ) {}

  async execute(prompt: string): Promise<AiImagePreviewResult> {
    const cleanedPrompt = prompt.trim()

    if (!cleanedPrompt) {
      throw new ApiError(400, 'Prompt is required')
    }

    const bannerOptimizedPrompt = `
Create a premium, high-quality profile banner background.
Subject instructions: ${cleanedPrompt}.
Composition: cinematic wide-profile cover style, visually rich but not cluttered,
important visual elements placed near the center so the image can be cropped into a horizontal banner,
balanced spacing on the left and right side.
Style: polished digital artwork, elegant lighting, detailed background, premium visual quality,
no text, no letters, no watermark, no logo, no UI elements.
`.trim()

    const image = await this.aiImageGenerationService.generatePreviewImage({
      prompt: bannerOptimizedPrompt,
      steps: 4,
      seed: Math.floor(Math.random() * 1_000_000),
    })

    return {
      imageUrl: image.dataUrl,
    }
  }
}
