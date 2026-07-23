export interface ICallTimeoutScheduler {
  schedule(callId: string, expiresAt: Date): void;
  cancel(callId: string): void;
}
