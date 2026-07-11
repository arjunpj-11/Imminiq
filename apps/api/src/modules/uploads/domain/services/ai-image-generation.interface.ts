export interface IGeneratePreviewImageInput {
  prompt: string
  steps: number
  seed: number
}

export interface IGeneratedPreviewImage {
  dataUrl: string
}

export interface IAIImageGenerator {
  generatePreviewImage(
    input: IGeneratePreviewImageInput,
  ): Promise<IGeneratedPreviewImage>
}
