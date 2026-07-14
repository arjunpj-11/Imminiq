import type { AdminPage } from '../../shared';
import type {
  AdminSupportTicket,
  AdminSupportTicketResult,
} from '../domain/entities/admin-support-ticket.entity';
import type {
  IAdminSupportTicketDTO,
  IAdminSupportTicketResultDTO,
} from './admin-support-tickets.dto';

export interface IAdminSupportTicketsMapper {
  toDTO(entity: AdminSupportTicket): IAdminSupportTicketDTO;
  toResultDTO(result: AdminSupportTicketResult): IAdminSupportTicketResultDTO;
  toPageDTO(page: AdminPage<AdminSupportTicket>): AdminPage<IAdminSupportTicketDTO>;
}

export class AdminSupportTicketsMapper implements IAdminSupportTicketsMapper {
  toDTO(entity: AdminSupportTicket): IAdminSupportTicketDTO {
    return { ...entity };
  }
  toResultDTO(result: AdminSupportTicketResult): IAdminSupportTicketResultDTO {
    return { ...result };
  }
  toPageDTO(page: AdminPage<AdminSupportTicket>): AdminPage<IAdminSupportTicketDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
