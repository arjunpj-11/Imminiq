import { Notification } from '../../../../../infrastructure/database/models/notification.model'
import { DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT } from '../../../domain/dashboard.constants'
import type { DashboardRecentActivityEntity } from '../../../domain/entities/dashboard-recent-activity.entity'
import type { GetRecentActivityInput } from '../../../domain/repositories/dashboard-notification.repository.interface'
import type { MongoNotificationRecord } from '../shared/mongo-dashboard.types'
import { MongoDashboardBaseRepository } from '../shared/mongo-dashboard-base.repository'
import { MongoDashboardErrorMapper } from '../shared/mongo-dashboard-error.mapper'
import { MongoDashboardMapper } from '../shared/mongo-dashboard.mapper'
import { MongoDashboardQueryUtils } from '../shared/mongo-dashboard-query.utils'

export class MongoDashboardNotificationRepository extends MongoDashboardBaseRepository {
  constructor(private readonly _mapper = new MongoDashboardMapper()) {
    super()
  }

  async getRecentActivity(
    input: GetRecentActivityInput,
  ): Promise<DashboardRecentActivityEntity[]> {
    return this.execute(
      'DASHBOARD_ACTIVITY_READ_FAILED',
      'Failed to read recent dashboard activity',
      async () => {
        const { userId, limit = DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT } =
          input

        const notifications = await Notification.find({
          userId,
          deletedAt: null,
        })
          .sort({ createdAt: -1 })
          .limit(
            MongoDashboardQueryUtils.safeLimit(
              limit,
              DASHBOARD_DEFAULT_RECENT_ACTIVITY_LIMIT,
            ),
          )
          .select('type message createdAt')
          .lean<MongoNotificationRecord[]>()

        return notifications.map((notification) =>
          this._mapper.toDashboardRecentActivityEntity(notification),
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.execute(
      'DASHBOARD_NOTIFICATION_READ_FAILED',
      'Failed to read dashboard notification count',
      async () =>
        Notification.countDocuments({
          userId,
          isRead: false,
          deletedAt: null,
        }),
      MongoDashboardErrorMapper.mapMongoError,
    )
  }
}

export const mongoDashboardNotificationRepository =
  new MongoDashboardNotificationRepository()
