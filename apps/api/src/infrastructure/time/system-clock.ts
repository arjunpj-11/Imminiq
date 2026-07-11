import type { ClockContract } from '../../shared/time/clock.interface'

export class SystemClock implements ClockContract {
  now(): Date {
    return new Date()
  }
}

export const systemClock = new SystemClock()
