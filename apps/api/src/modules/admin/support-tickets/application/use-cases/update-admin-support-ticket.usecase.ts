import type { AdminActor } from '../../../../../shared/admin';
import type { AdminSupportTicketUpdate } from '../../domain/entities/admin-support-ticket.entity';
import type { IAdminSupportTicketsRepository } from '../../domain/repositories/admin-support-tickets.repository.interface';
import { AdminSupportTicketsApplicationError } from '../admin-support-tickets-application.error';
import type { AdminSupportTicketResultDTO } from '../admin-support-tickets.dto';
import type { IAdminSupportTicketsMapper } from '../admin-support-tickets.mapper';

export interface IUpdateAdminSupportTicketUseCase {
  execute(
    id: string,
    input: AdminSupportTicketUpdate,
    actor: AdminActor
  ): Promise<AdminSupportTicketResultDTO>;
}

export class UpdateAdminSupportTicketUseCase implements IUpdateAdminSupportTicketUseCase {
  constructor(
    private readonly repository: IAdminSupportTicketsRepository,
    private readonly mapper: IAdminSupportTicketsMapper
  ) {}

  async execute(
    id: string,
    input: AdminSupportTicketUpdate,
    actor: AdminActor
  ): Promise<AdminSupportTicketResultDTO> {
    const result = await this.repository.update(id, input, actor);
    if (!result) throw AdminSupportTicketsApplicationError.notFound();
    return this.mapper.toResultDTO(result);
  }
}
