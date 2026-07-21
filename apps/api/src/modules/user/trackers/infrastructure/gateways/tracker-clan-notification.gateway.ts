import type { ICreateNotificationUseCase } from '../../../../notifications';
import type {
  ITrackerClanNotificationNotifier,
  TrackerClanNotificationInput,
} from '../../domain';

export class TrackerClanNotificationGateway implements ITrackerClanNotificationNotifier {
  constructor(private readonly _createNotification: ICreateNotificationUseCase) {}

  async notify(input: TrackerClanNotificationInput) {
    try {
      await this._createNotification.execute({
        userId: input.userId,
        type: input.type,
        message: input.message,
        deepLink: input.deepLink,
        metadata: {
          ...input.metadata,
          eventId: input.eventId,
        },
      });
    } catch (error) {
      const duplicateKey =
        typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
      if (!duplicateKey) {
        console.error('[TrackerClanNotification] Unable to create notification', error);
      }
    }
  }
}
