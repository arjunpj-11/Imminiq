import { generateImageWithCloudflare } from '../../../../infrastructure/ai/cloudflare-image.client'
import type {
  AiImageGenerationGateway,
  GeneratePreviewImageInput,
  GeneratedPreviewImage,
} from '../../domain/gateways/ai-image-generation.gateway'

export const cloudflareAiImageGenerationGateway: AiImageGenerationGateway = {
  async generatePreviewImage(
    input: GeneratePreviewImageInput
  ): Promise<GeneratedPreviewImage> {
    return generateImageWithCloudflare(input)
  },
}
