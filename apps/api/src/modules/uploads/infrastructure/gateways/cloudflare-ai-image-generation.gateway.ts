import { generateImageWithCloudflare } from '../../../../infrastructure/ai/clients/cloudflare-image.client'
import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type {
  AiImageGenerationServiceContract,
  GeneratedPreviewImage,
  GeneratePreviewImageInput,
} from '../../domain/services/ai-image-generation.service.interface'

export class CloudflareAiImageGenerationGateway
  implements AiImageGenerationServiceContract
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

export const cloudflareAiImageGenerationGateway =
  new CloudflareAiImageGenerationGateway()
