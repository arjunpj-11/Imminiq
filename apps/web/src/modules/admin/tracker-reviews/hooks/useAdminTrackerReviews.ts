import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../../../lib/axios'
import type { AdminListQuery, AdminPageData, ApiEnvelope } from '../../admin-api.types'
import type { AdminTrackerReview } from '../types/admin-tracker-reviews.types'
export const useAdminTrackerReviews = (query: AdminListQuery) => useQuery({ queryKey: ['admin', 'tracker-reviews', query], queryFn: async () => (await api.get<ApiEnvelope<AdminPageData<AdminTrackerReview>>>('/admin/tracker-reviews', { params: query })).data.data, placeholderData: keepPreviousData })
export const useResolveAdminTrackerReview = () => { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => api.patch(`/admin/tracker-reviews/${id}/status`, { status }), onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'tracker-reviews'] }) }) }
