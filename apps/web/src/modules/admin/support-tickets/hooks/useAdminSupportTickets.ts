import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../../../lib/axios'
import type { AdminListQuery, AdminPageData, ApiEnvelope } from '../../admin-api.types'
import type { AdminSupportTicket } from '../types/admin-support-tickets.types'
export const useAdminSupportTickets = (query: AdminListQuery) => useQuery({ queryKey: ['admin', 'support-tickets', query], queryFn: async () => (await api.get<ApiEnvelope<AdminPageData<AdminSupportTicket>>>('/admin/support-tickets', { params: query })).data.data, placeholderData: keepPreviousData })
export const useUpdateAdminSupportTicket = () => { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, status, resolutionNote, notificationMessage }: { id: string; status: AdminSupportTicket['status']; resolutionNote?: string; notificationMessage?: string }) => api.patch(`/admin/support-tickets/${id}`, { status, resolutionNote, notificationMessage }), onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'support-tickets'] }) }) }
