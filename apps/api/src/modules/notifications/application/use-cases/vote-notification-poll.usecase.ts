import type { INotificationCommandRepository } from '../../domain';
import type { VoteNotificationPollResponseDTO } from '../notifications.dto';
import { NotificationApplicationError } from '../notifications-application.error';

export interface IVoteNotificationPollUseCase {
  execute(
    userId: string,
    notificationId: string,
    optionIndex: number
  ): Promise<VoteNotificationPollResponseDTO>;
}

export class VoteNotificationPollUseCase implements IVoteNotificationPollUseCase {
  constructor(private readonly _repository: INotificationCommandRepository) {}

  async execute(userId: string, notificationId: string, optionIndex: number) {
    const result = await this._repository.voteForPoll(userId, notificationId, optionIndex);
    if (!result.success) {
      if (result.reason === 'NOT_FOUND') {
        throw NotificationApplicationError.notFound('Poll not found');
      }
      throw NotificationApplicationError.invalid('Invalid poll option');
    }
    return { optionIndex };
  }
}
