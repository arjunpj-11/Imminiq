import {
  CreateNotificationUseCase,
  ListNotificationsUseCase,
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
  VoteNotificationPollUseCase,
  NotificationsMapper,
  type NotificationsUseCases,
} from './application';
import { mongoNotificationsRepository } from './infrastructure';

export type NotificationsComposition = {
  useCases: NotificationsUseCases;
  helpers: { notificationsMapper: NotificationsMapper };
};
export const createNotificationsComposition = (): NotificationsComposition => {
  const notificationsMapper = new NotificationsMapper();
  return {
    useCases: {
      listNotifications: new ListNotificationsUseCase(
        mongoNotificationsRepository,
        notificationsMapper
      ),
      createNotification: new CreateNotificationUseCase(mongoNotificationsRepository),
      markNotificationRead: new MarkNotificationReadUseCase(mongoNotificationsRepository),
      markAllNotificationsRead: new MarkAllNotificationsReadUseCase(mongoNotificationsRepository),
      voteForPoll: new VoteNotificationPollUseCase(mongoNotificationsRepository),
    },
    helpers: { notificationsMapper },
  };
};
