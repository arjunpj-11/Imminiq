import type { IClock } from '../../shared/time/clock.interface'

export class SystemClock implements IClock {
  now(): Date {
    return new Date()
  }
}

export const systemClock = new SystemClock()
