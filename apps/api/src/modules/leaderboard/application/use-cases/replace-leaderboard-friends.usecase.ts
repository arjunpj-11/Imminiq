import type { ILeaderboardActivityRepository } from '../../domain/repositories/leaderboard-activity.repository.interface'
import type { ReplaceLeaderboardFriendsPayloadDTO } from '../dtos/leaderboard.dto'

export class ReplaceLeaderboardFriendsUseCase {
  constructor(
    private readonly _leaderboardRepository: ILeaderboardActivityRepository,
  ) {}

  async execute(payload: ReplaceLeaderboardFriendsPayloadDTO): Promise<void> {
    const friendUserIds = [
      ...new Set(
        payload.friendUserIds
          .map((userId) => userId.trim())
          .filter(
            (userId) => userId.length > 0 && userId !== payload.userId,
          ),
      ),
    ]

    await this._leaderboardRepository.replaceFriendUserIds({
      userId: payload.userId,
      friendUserIds,
    })
  }
}
