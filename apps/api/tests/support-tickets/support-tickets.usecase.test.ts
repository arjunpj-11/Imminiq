import { describe, expect, it, vi } from 'vitest';

import { SupportTicketsMapper } from '../../src/modules/user/support-tickets/application/support-tickets.mapper';
import { CreateSupportTicketUseCase } from '../../src/modules/user/support-tickets/application/use-cases/create-support-ticket.usecase';
import type { ISupportTicketsRepository } from '../../src/modules/user/support-tickets/domain/repositories/support-tickets.repository.interface';

const input = {
  subject: 'Unable to open my lesson',
  description: 'The lesson page keeps failing after I select the next topic.',
  category: 'technical' as const,
  priority: 'high' as const,
};

describe('support ticket use cases', () => {
  it('maps the created ticket through the application DTO boundary', async () => {
    const repository: ISupportTicketsRepository = {
      create: vi.fn(async () => ({
        id: 'ticket-1',
        subject: input.subject,
        status: 'open',
        createdAt: new Date('2026-07-14T10:00:00.000Z'),
      })),
    };
    const useCase = new CreateSupportTicketUseCase(repository, new SupportTicketsMapper());

    await expect(useCase.execute('user-1', input)).resolves.toEqual({
      id: 'ticket-1',
      subject: input.subject,
      status: 'open',
      createdAt: '2026-07-14T10:00:00.000Z',
    });
    expect(repository.create).toHaveBeenCalledWith('user-1', input);
  });

  it('returns a safe operational error when persistence fails', async () => {
    const repository: ISupportTicketsRepository = {
      create: vi.fn(async () => {
        throw new Error('database connection details');
      }),
    };
    const useCase = new CreateSupportTicketUseCase(repository, new SupportTicketsMapper());

    await expect(useCase.execute('user-1', input)).rejects.toMatchObject({
      statusCode: 500,
      code: 'SUPPORT_TICKET_CREATION_FAILED',
      message: 'We could not create your support ticket. Please try again.',
    });
  });
});
