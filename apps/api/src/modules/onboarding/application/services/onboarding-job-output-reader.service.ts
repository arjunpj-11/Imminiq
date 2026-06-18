export interface OnboardingJobOutputReaderServiceContract {
  getTrackerId(
    outputData: Record<string, unknown> | undefined,
  ): string | null

  getEvaluation(
    outputData: Record<string, unknown> | undefined,
  ): Record<string, unknown> | null
}

export class OnboardingJobOutputReaderService
  implements OnboardingJobOutputReaderServiceContract
{
  getTrackerId(
    outputData: Record<string, unknown> | undefined,
  ): string | null {
    const trackerId = outputData?.trackerId

    return typeof trackerId === 'string' ? trackerId : null
  }

  getEvaluation(
    outputData: Record<string, unknown> | undefined,
  ): Record<string, unknown> | null {
    const evaluation = outputData?.evaluation

    return this.isRecord(evaluation) ? evaluation : null
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
  }
}
