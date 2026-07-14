import type { AdminActor } from '../../../shared';
import type {
  AdminSupportTicketResult,
  AdminSupportTicketUpdate,
} from '../../domain/entities/admin-support-ticket.entity';
import type { IAdminSupportTicketsRepository } from '../../domain/repositories/admin-support-tickets.repository.interface';
import { AdminSupportTicketsApplicationError } from '../admin-support-tickets-application.error';

export interface IUpdateAdminSupportTicketUseCase {
  execute(
    id: string,
    input: AdminSupportTicketUpdate,
    actor: AdminActor
  ): Promise<AdminSupportTicketResult>;
}

export class UpdateAdminSupportTicketUseCase implements IUpdateAdminSupportTicketUseCase {
  constructor(private readonly repository: IAdminSupportTicketsRepository) {}

  async execute(
    id: string,
    input: AdminSupportTicketUpdate,
    actor: AdminActor
  ): Promise<AdminSupportTicketResult> {
    const result = await this.repository.update(id, input, actor);
    if (!result) throw AdminSupportTicketsApplicationError.notFound();
    return result;
  }
}
