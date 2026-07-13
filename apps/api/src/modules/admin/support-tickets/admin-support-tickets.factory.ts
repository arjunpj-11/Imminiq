import { AdminSupportTicketsUseCase } from './application/use-cases/admin-support-tickets.usecase';
import { mongoAdminSupportTicketsRepository } from './infrastructure/repositories/mongo-admin-support-tickets.repository';
export const createAdminSupportTicketsComposition = () => ({
  useCase: new AdminSupportTicketsUseCase(mongoAdminSupportTicketsRepository),
});
