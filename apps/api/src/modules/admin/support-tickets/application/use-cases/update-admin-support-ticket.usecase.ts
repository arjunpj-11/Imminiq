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
    private readonly _repository: IAdminSupportTicketsRepository,
    private readonly _mapper: IAdminSupportTicketsMapper
  ) {}

  async execute(
    id: string,
    input: AdminSupportTicketUpdate,
    actor: AdminActor
  ): Promise<AdminSupportTicketResultDTO> {
    const result = await this._repository.update(id, input, actor);
    if (!result) throw AdminSupportTicketsApplicationError.notFound();
    return this._mapper.toResultDTO(result);
  }
}
