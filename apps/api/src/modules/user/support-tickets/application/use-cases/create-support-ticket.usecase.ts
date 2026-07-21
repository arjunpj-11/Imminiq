import type { ISupportTicketsRepository } from '../../domain/repositories/support-tickets.repository.interface';
import { SupportTicketsApplicationError } from '../support-tickets-application.error';
import type { CreateSupportTicketDTO, SupportTicketCreatedDTO } from '../support-tickets.dto';
import type { ISupportTicketsMapper } from '../support-tickets.mapper';
export interface ICreateSupportTicketUseCase {
  execute(userId: string, input: CreateSupportTicketDTO): Promise<SupportTicketCreatedDTO>;
}
export class CreateSupportTicketUseCase implements ICreateSupportTicketUseCase {
  constructor(
    private readonly _repository: ISupportTicketsRepository,
    private readonly _mapper: ISupportTicketsMapper
  ) {}

  async execute(userId: string, input: CreateSupportTicketDTO) {
    try {
      const ticket = await this._repository.create(userId, this._mapper.toCreateInput(input));
      return this._mapper.toCreatedDTO(ticket);
    } catch {
      throw SupportTicketsApplicationError.creationFailed();
    }
  }
}
