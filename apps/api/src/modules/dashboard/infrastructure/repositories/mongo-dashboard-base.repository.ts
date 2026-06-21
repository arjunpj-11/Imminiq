import mongoose from 'mongoose'

import { DASHBOARD_MAX_RECENT_ITEMS_LIMIT } from '../../domain/constants/dashboard.constants'
import { DashboardDomainError } from '../../domain/errors/dashboard-domain.error'
import type { ErrorMapper } from './mongo-dashboard-error.mapper'

export abstract class MongoDashboardBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof DashboardDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new DashboardDomainError(code, message)
    }
  }

  protected safeLimit(limit: number | undefined, fallback: number): number {
    if (!limit || !Number.isFinite(limit)) {
      return fallback
    }

    return Math.max(
      1,
      Math.min(DASHBOARD_MAX_RECENT_ITEMS_LIMIT, Math.trunc(limit)),
    )
  }

  protected toObjectId(id: string): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new DashboardDomainError(
        'DASHBOARD_INVALID_USER_ID',
        'Invalid dashboard user id',
      )
    }

    return new mongoose.Types.ObjectId(id)
  }
}