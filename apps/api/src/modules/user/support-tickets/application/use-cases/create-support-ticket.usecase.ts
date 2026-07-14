import type { ISupportTicketsRepository } from '../../domain/repositories/support-tickets.repository.interface';
import { SupportTicketsApplicationError } from '../support-tickets-application.error';
import type { CreateSupportTicketDTO, SupportTicketCreatedDTO } from '../support-tickets.dto';
import type { ISupportTicketsMapper } from '../support-tickets.mapper';
export interface ICreateSupportTicketUseCase {
  execute(userId: string, input: CreateSupportTicketDTO): Promise<SupportTicketCreatedDTO>;
}
export class CreateSupportTicketUseCase implements ICreateSupportTicketUseCase {
  constructor(
    private readonly repository: ISupportTicketsRepository,
    private readonly mapper: ISupportTicketsMapper
  ) {}

  async execute(userId: string, input: CreateSupportTicketDTO) {
    try {
      const ticket = await this.repository.create(userId, this.mapper.toCreateInput(input));
      return this.mapper.toCreatedDTO(ticket);
    } catch {
      throw SupportTicketsApplicationError.creationFailed();
    }
  }
}
