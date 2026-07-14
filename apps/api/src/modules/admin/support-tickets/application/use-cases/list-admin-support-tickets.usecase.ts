import type { AdminListQuery, AdminPage } from '../../../shared';
import type { IAdminSupportTicketsRepository } from '../../domain/repositories/admin-support-tickets.repository.interface';
import type { IAdminSupportTicketDTO } from '../admin-support-tickets.dto';
import type { IAdminSupportTicketsMapper } from '../admin-support-tickets.mapper';

export interface IListAdminSupportTicketsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<IAdminSupportTicketDTO>>;
}

export class ListAdminSupportTicketsUseCase implements IListAdminSupportTicketsUseCase {
  constructor(
    private readonly repository: IAdminSupportTicketsRepository,
    private readonly mapper: IAdminSupportTicketsMapper
  ) {}

  async execute(query: AdminListQuery): Promise<AdminPage<IAdminSupportTicketDTO>> {
    return this.mapper.toPageDTO(await this.repository.list(query));
  }
}
