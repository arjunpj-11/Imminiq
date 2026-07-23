import type { ICallTimeoutScheduler } from '../../domain/services/call-timeout-scheduler.interface';

export class NodeCallTimeoutScheduler implements ICallTimeoutScheduler {
  private readonly _timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly _onExpire: (callId: string) => Promise<void>) {}

  schedule(callId: string, expiresAt: Date): void {
    this.cancel(callId);
    const timer = setTimeout(() => {
      this._timers.delete(callId);
      void this._onExpire(callId).catch(() => undefined);
    }, Math.max(0, expiresAt.getTime() - Date.now()));
    timer.unref?.();
    this._timers.set(callId, timer);
  }

  cancel(callId: string): void {
    const timer = this._timers.get(callId);
    if (timer) clearTimeout(timer);
    this._timers.delete(callId);
  }
}
