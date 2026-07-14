import type { AdminListQuery, AdminPage } from '../../../shared/domain';
import type { IAdminSupportTicketsRepository } from '../../domain/repositories/admin-support-tickets.repository.interface';
import type { AdminSupportTicketDTO } from '../admin-support-tickets.dto';
import type { IAdminSupportTicketsMapper } from '../admin-support-tickets.mapper';

export interface IListAdminSupportTicketsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminSupportTicketDTO>>;
}

export class ListAdminSupportTicketsUseCase implements IListAdminSupportTicketsUseCase {
  constructor(
    private readonly repository: IAdminSupportTicketsRepository,
    private readonly mapper: IAdminSupportTicketsMapper
  ) {}

  async execute(query: AdminListQuery): Promise<AdminPage<AdminSupportTicketDTO>> {
    return this.mapper.toPageDTO(await this.repository.list(query));
  }
}
