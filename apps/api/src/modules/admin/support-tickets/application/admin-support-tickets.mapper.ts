import type { AdminPage } from '../../../../shared/admin';
import type {
  AdminSupportTicket,
  AdminSupportTicketResult,
} from '../domain/entities/admin-support-ticket.entity';
import type {
  AdminSupportTicketDTO,
  AdminSupportTicketResultDTO,
} from './admin-support-tickets.dto';

export interface IAdminSupportTicketsMapper {
  toDTO(entity: AdminSupportTicket): AdminSupportTicketDTO;
  toResultDTO(result: AdminSupportTicketResult): AdminSupportTicketResultDTO;
  toPageDTO(page: AdminPage<AdminSupportTicket>): AdminPage<AdminSupportTicketDTO>;
}

export class AdminSupportTicketsMapper implements IAdminSupportTicketsMapper {
  toDTO(entity: AdminSupportTicket): AdminSupportTicketDTO {
    return { ...entity };
  }
  toResultDTO(result: AdminSupportTicketResult): AdminSupportTicketResultDTO {
    return { ...result };
  }
  toPageDTO(page: AdminPage<AdminSupportTicket>): AdminPage<AdminSupportTicketDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
