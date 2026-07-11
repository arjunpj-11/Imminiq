import { generateImageWithCloudflare } from '../../../../infrastructure/ai/clients/cloudflare-image.client'
import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type {
  AIImageGeneratorContract,
  GeneratedPreviewImage,
  GeneratePreviewImageInput,
} from '../../domain/services/ai-image-generation.interface'

export class CloudflareAIImageGenerationGateway
  implements AIImageGeneratorContract
{
  async generatePreviewImage(
    input: GeneratePreviewImageInput,
  ): Promise<GeneratedPreviewImage> {
    try {
      return await generateImageWithCloudflare(input)
    } catch {
      throw new UploadsDomainError(
        'AI_IMAGE_GENERATION_FAILED',
        'AI image generation failed',
      )
    }
  }
}

export const cloudflareAIImageGenerationGateway =
  new CloudflareAIImageGenerationGateway()
