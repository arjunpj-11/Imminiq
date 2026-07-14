import { generateImageWithCloudflare } from '../../../../infrastructure/ai/clients/cloudflare-image.client';
import { UploadsDomainError } from '../../domain/uploads-domain.error';
import type {
  IAIImageGenerator,
  IGeneratedPreviewImage,
  IGeneratePreviewImageInput,
} from '../../domain/services/ai-image-generation.interface';

export class CloudflareAIImageGenerationGateway implements IAIImageGenerator {
  async generatePreviewImage(input: IGeneratePreviewImageInput): Promise<IGeneratedPreviewImage> {
    try {
      return await generateImageWithCloudflare(input);
    } catch {
      throw new UploadsDomainError('AI_IMAGE_GENERATION_FAILED', 'AI image generation failed');
    }
  }
}

export const cloudflareAIImageGenerationGateway = new CloudflareAIImageGenerationGateway();
