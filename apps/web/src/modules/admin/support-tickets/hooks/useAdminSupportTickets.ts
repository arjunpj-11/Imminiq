import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminListQuery, AdminPageData, ApiEnvelope } from '../../shared';
import type { AdminSupportTicket } from '../types/admin-support-tickets.types';
import { adminSupportTicketsKeys } from './admin-support-tickets.query-keys';
export const useAdminSupportTickets = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminSupportTicketsKeys.list(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminSupportTicket>>>('/admin/support-tickets', {
          params: query,
        })
      ).data.data,
    placeholderData: keepPreviousData,
  });
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
      api.patch(`/admin/support-tickets/${id}`, { status, resolutionNote, notificationMessage }),
    onSuccess: () => client.invalidateQueries({ queryKey: adminSupportTicketsKeys.all }),
  });
};
