export interface GeneratePreviewImageInput {
  prompt: string
  steps: number
  seed: number
}

export interface GeneratedPreviewImage {
  dataUrl: string
}

export interface AiImageGenerationGateway {
  generatePreviewImage(
    input: GeneratePreviewImageInput
  ): Promise<GeneratedPreviewImage>
}
