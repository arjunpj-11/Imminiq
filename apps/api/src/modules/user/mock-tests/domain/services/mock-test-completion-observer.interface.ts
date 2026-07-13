export interface IMockTestCompletionObserver {
  onCompleted(input: {
    userId: string;
    testId: string;
    attemptId: string;
    scorePercentage: number;
  }): Promise<void>;
}
