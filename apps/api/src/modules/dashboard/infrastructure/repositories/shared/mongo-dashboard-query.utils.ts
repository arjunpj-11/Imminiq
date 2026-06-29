import mongoose from 'mongoose'

import { DASHBOARD_MAX_RECENT_ITEMS_LIMIT } from '../../../domain/constants/dashboard.constants'
import { DashboardDomainError } from '../../../domain/errors/dashboard-domain.error'

export class MongoDashboardQueryUtils {
  private constructor() {}

  static safeLimit(limit: number | undefined, fallback: number): number {
    if (!limit || !Number.isFinite(limit)) {
      return fallback
    }

    return Math.max(
      1,
      Math.min(DASHBOARD_MAX_RECENT_ITEMS_LIMIT, Math.trunc(limit)),
    )
  }

  static toObjectId(id: string): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new DashboardDomainError(
        'DASHBOARD_INVALID_USER_ID',
        'Invalid dashboard user id',
      )
    }

    return new mongoose.Types.ObjectId(id)
  }
}
