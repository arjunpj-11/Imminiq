import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminSupportTicket } from '../types/admin-support-tickets.types';
import { ADMIN_SUPPORT_TICKETS_ENDPOINTS } from '../constants/admin-support-tickets.constants';
import { adminSupportTicketsKeys } from './admin-support-tickets.query-keys';

export const useUpdateAdminSupportTicket = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNote,
      notificationMessage,
    }: {
      id: string;
      status: AdminSupportTicket['status'];
      resolutionNote?: string;
      notificationMessage?: string;
    }) =>
      api.patch(ADMIN_SUPPORT_TICKETS_ENDPOINTS.update(id), {
        status,
        resolutionNote,
        notificationMessage,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: adminSupportTicketsKeys.all }),
  });
};
