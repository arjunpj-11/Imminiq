import { AdminSubscriptionsUseCase } from './application/admin-subscriptions.usecase';
import { mongoAdminSubscriptionsRepository } from './infrastructure/mongo-admin-subscriptions.repository';

export const createAdminSubscriptionsComposition = () => ({
  useCase: new AdminSubscriptionsUseCase(mongoAdminSubscriptionsRepository),
});
