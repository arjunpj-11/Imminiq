import type { UsersRepository } from '../../domain/repositories/users.repository.interface'
import type { EarnedBadgeRecord } from '../../domain/types/users.types'
import { isRecord, toIdString } from '../utils/users-view-mappers'

export class GetMyBadgesUseCase {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(userId: string, page: number, limit: number) {
    const { items, total } =
      await this.usersRepository.findEarnedBadgesPaginated(userId, page, limit)

    const typedItems = items as EarnedBadgeRecord[]

    return {
      items: typedItems
        .filter(
          (
            item
          ): item is EarnedBadgeRecord & {
            badgeId: NonNullable<EarnedBadgeRecord['badgeId']>
          } => Boolean(item.badgeId)
        )
        .map((item) => ({
          _id: toIdString(item.badgeId._id),
          name: item.badgeId.name ?? '',
          description: item.badgeId.description ?? '',
          iconUrl: item.badgeId.iconUrl ?? '',
          badgeType: item.badgeId.badgeType,
          criteria: isRecord(item.badgeId.criteria)
            ? item.badgeId.criteria
            : {},
          earnedAt: item.earnedAt,
        })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }
}
