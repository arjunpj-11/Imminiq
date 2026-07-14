import { useMutation } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { SUPPORT_TICKET_API_PATHS } from '../constants/support-tickets.constants';
import type {
  CreateSupportTicketInput,
  SupportTicketCreated,
} from '../types/support-tickets.types';
type ApiEnvelope<T> = { data: T };
export const useCreateSupportTicket = () =>
  useMutation({
    mutationFn: async (input: CreateSupportTicketInput) =>
      (await api.post<ApiEnvelope<SupportTicketCreated>>(SUPPORT_TICKET_API_PATHS.root, input)).data
        .data,
  });
