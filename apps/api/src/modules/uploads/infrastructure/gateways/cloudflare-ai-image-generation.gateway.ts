import { generateImageWithCloudflare } from '../../../../infrastructure/ai/cloudflare-image.client'
import type {
  AiImageGenerationServiceContract,
  GeneratePreviewImageInput,
  GeneratedPreviewImage,
} from '../../domain/services/ai-image-generation.service.interface'

export const cloudflareAiImageGenerationGateway: AiImageGenerationServiceContract = {
  async generatePreviewImage(
    input: GeneratePreviewImageInput
  ): Promise<GeneratedPreviewImage> {
    return generateImageWithCloudflare(input)
  },
}
