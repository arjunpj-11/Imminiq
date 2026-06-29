import { Tracker } from '../../../../../infrastructure/database/models/tracker.model'
import type { PublishedTrackerEntity } from '../../../domain/entities/published-tracker.entity'
import type { FindPublishedTrackersInput } from '../../../domain/repositories/users.repository.interface'
import { MongoUsersBaseRepository } from '../shared/mongo-users-base.repository'
import { MongoUsersMapper } from '../shared/mongo-users.mapper'
import { MongoUsersObjectId } from '../shared/mongo-users-object-id'
import type { MongoTrackerRecord } from '../shared/mongo-users.types'

export class MongoUsersTrackerRepository extends MongoUsersBaseRepository {
  constructor(private readonly _mapper = new MongoUsersMapper()) {
    super()
  }

  async findPublishedTrackers(
    input: FindPublishedTrackersInput,
  ): Promise<{ items: PublishedTrackerEntity[]; total: number }> {
    return this.execute(
      'USER_PUBLISHED_TRACKER_READ_FAILED',
      'Failed to read published trackers',
      async () => {
        const { ownerId, query, includePrivate = false } = input
        const skip = (query.page - 1) * query.limit

        const filter: Record<string, unknown> = {
          ownerId: MongoUsersObjectId.from(ownerId),
          deletedAt: null,
          status: query.status ?? 'active',
        }

        if (!includePrivate) {
          filter.visibility = 'public'
        }

        if (query.search) {
          const safeSearch = this._mapper.escapeRegex(query.search)

          filter.$or = [
            {
              title: {
                $regex: safeSearch,
                $options: 'i',
              },
            },
            {
              description: {
                $regex: safeSearch,
                $options: 'i',
              },
            },
            {
              category: {
                $regex: safeSearch,
                $options: 'i',
              },
            },
          ]
        }

        const [items, total] = await Promise.all([
          Tracker.find(filter)
            .sort(this._mapper.buildTrackerSort(query.sort))
            .skip(skip)
            .limit(query.limit)
            .lean<MongoTrackerRecord[]>(),
          Tracker.countDocuments(filter),
        ])

        return {
          items: items.map((item) =>
            this._mapper.toPublishedTrackerEntity(item),
          ),
          total,
        }
      },
    )
  }
}

export const mongoUsersTrackerRepository = new MongoUsersTrackerRepository()
