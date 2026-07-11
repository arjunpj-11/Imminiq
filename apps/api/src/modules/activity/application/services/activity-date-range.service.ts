import {
  ACTIVITY_MAX_UTC_OFFSET_MINUTES,
  ACTIVITY_MIN_UTC_OFFSET_MINUTES,
  ACTIVITY_MIN_YEAR,
} from '../../domain/constants/activity.constants'
import type { ActivityTimeRange } from '../../domain/types/activity.types'
import { ActivityApplicationError } from '../errors/activity-application.error'

const MINUTE_IN_MS = 60_000
const DAY_IN_MS = 86_400_000

export type ActivityDateContext = {
  now: Date
  year: number
  utcOffsetMinutes: number
  timezone: string

  todayKey: string
  yesterdayKey: string

  yearRange: ActivityTimeRange
  currentWeekRange: ActivityTimeRange
  previousWeekRange: ActivityTimeRange
  todayRange: ActivityTimeRange

  currentWeekDateKeys: string[]
}

export class ActivityDateRangeService {
  createContext(
    now: Date,
    requestedYear?: number,
    utcOffsetMinutes = 0,
  ): ActivityDateContext {
    this.ensureValidOffset(utcOffsetMinutes)

    const shiftedNow = this.shift(now, utcOffsetMinutes)
    const currentLocalYear = shiftedNow.getUTCFullYear()
    const year = requestedYear ?? currentLocalYear

    if (
      !Number.isInteger(year) ||
      year < ACTIVITY_MIN_YEAR ||
      year > currentLocalYear
    ) {
      throw ActivityApplicationError.invalidYear(
        `Activity year must be between ${ACTIVITY_MIN_YEAR} and ${currentLocalYear}`,
      )
    }

    const localTodayStart = Date.UTC(
      shiftedNow.getUTCFullYear(),
      shiftedNow.getUTCMonth(),
      shiftedNow.getUTCDate(),
    )

    const localDayOfWeek =
      new Date(localTodayStart).getUTCDay()

    const daysSinceMonday =
      localDayOfWeek === 0 ? 6 : localDayOfWeek - 1

    const localCurrentWeekStart =
      localTodayStart - daysSinceMonday * DAY_IN_MS

    const currentWeekRange = {
      start: this.unshift(
        new Date(localCurrentWeekStart),
        utcOffsetMinutes,
      ),
      end: this.unshift(
        new Date(localCurrentWeekStart + 7 * DAY_IN_MS),
        utcOffsetMinutes,
      ),
    }

    const previousWeekRange = {
      start: new Date(
        currentWeekRange.start.getTime() - 7 * DAY_IN_MS,
      ),
      end: new Date(currentWeekRange.start),
    }

    const todayRange = {
      start: this.unshift(
        new Date(localTodayStart),
        utcOffsetMinutes,
      ),
      end: this.unshift(
        new Date(localTodayStart + DAY_IN_MS),
        utcOffsetMinutes,
      ),
    }

    const yearRange = {
      start: this.unshift(
        new Date(Date.UTC(year, 0, 1)),
        utcOffsetMinutes,
      ),
      end: this.unshift(
        new Date(Date.UTC(year + 1, 0, 1)),
        utcOffsetMinutes,
      ),
    }

    return {
      now,
      year,
      utcOffsetMinutes,
      timezone: this.toMongoTimezone(utcOffsetMinutes),

      todayKey: this.toLocalDateKey(now, utcOffsetMinutes),
      yesterdayKey: this.toLocalDateKey(
        new Date(now.getTime() - DAY_IN_MS),
        utcOffsetMinutes,
      ),

      yearRange,
      currentWeekRange,
      previousWeekRange,
      todayRange,

      currentWeekDateKeys: Array.from(
        { length: 7 },
        (_, index) =>
          this.toLocalDateKey(
            new Date(
              currentWeekRange.start.getTime() +
                index * DAY_IN_MS,
            ),
            utcOffsetMinutes,
          ),
      ),
    }
  }

  toLocalDateKey(
    date: Date,
    utcOffsetMinutes: number,
  ): string {
    return this.shift(date, utcOffsetMinutes)
      .toISOString()
      .slice(0, 10)
  }

  weekdayLabel(dateKey: string): string {
    const date = new Date(`${dateKey}T00:00:00.000Z`)

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    }).format(date)
  }

  groupLabel(
    dateKey: string,
    context: Pick<
      ActivityDateContext,
      'todayKey' | 'yesterdayKey'
    >,
  ): string {
    if (dateKey === context.todayKey) {
      return 'Today'
    }

    if (dateKey === context.yesterdayKey) {
      return 'Yesterday'
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${dateKey}T00:00:00.000Z`))
  }

  private ensureValidOffset(utcOffsetMinutes: number): void {
    if (
      !Number.isInteger(utcOffsetMinutes) ||
      utcOffsetMinutes < ACTIVITY_MIN_UTC_OFFSET_MINUTES ||
      utcOffsetMinutes > ACTIVITY_MAX_UTC_OFFSET_MINUTES
    ) {
      throw ActivityApplicationError.invalidUtcOffset(
        `UTC offset must be between ${ACTIVITY_MIN_UTC_OFFSET_MINUTES} and ${ACTIVITY_MAX_UTC_OFFSET_MINUTES} minutes`,
      )
    }
  }

  private shift(date: Date, offset: number): Date {
    return new Date(date.getTime() + offset * MINUTE_IN_MS)
  }

  private unshift(date: Date, offset: number): Date {
    return new Date(date.getTime() - offset * MINUTE_IN_MS)
  }

  private toMongoTimezone(offset: number): string {
    const sign = offset >= 0 ? '+' : '-'
    const absolute = Math.abs(offset)
    const hours = Math.floor(absolute / 60)
    const minutes = absolute % 60

    return `${sign}${String(hours).padStart(2, '0')}:${String(
      minutes,
    ).padStart(2, '0')}`
  }
}

export type ActivityDateRangeServiceContract = Pick<
  ActivityDateRangeService,
  'createContext' | 'toLocalDateKey' | 'weekdayLabel' | 'groupLabel'
>
