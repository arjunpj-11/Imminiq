import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../../../lib/axios'
import type { AdminListQuery, AdminPageData, ApiEnvelope } from '../../admin-api.types'
import type { AdminTracker, AdminTrackerDetail } from '../types/admin-trackers.types'
export const useAdminTrackers = (query: AdminListQuery) => useQuery({ queryKey: ['admin', 'trackers', query], queryFn: async () => (await api.get<ApiEnvelope<AdminPageData<AdminTracker>>>('/admin/trackers', { params: query })).data.data, placeholderData: keepPreviousData })
export const useAdminTrackerDetail = (id?: string) => useQuery({ queryKey: ['admin', 'trackers', 'detail', id], queryFn: async () => (await api.get<ApiEnvelope<AdminTrackerDetail>>(`/admin/trackers/${id}`)).data.data, enabled: Boolean(id) })
export const useDeleteAdminTracker = () => { const client = useQueryClient(); return useMutation({ mutationFn: (id: string) => api.delete(`/admin/trackers/${id}`), onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'trackers'] }) }) }
