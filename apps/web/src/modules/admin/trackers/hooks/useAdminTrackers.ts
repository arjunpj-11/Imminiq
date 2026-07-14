import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminListQuery, AdminPageData, ApiEnvelope } from '../../admin-api.types';
import type {
  AdminPublishedTracker,
  AdminTracker,
  AdminTrackerDetail,
} from '../types/admin-trackers.types';
export const useAdminTrackers = (query: AdminListQuery) =>
  useQuery({
    queryKey: ['admin', 'trackers', query],
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminTracker>>>('/admin/trackers', {
          params: query,
        })
      ).data.data,
    placeholderData: keepPreviousData,
  });
export const useAdminTrackerDetail = (id?: string) =>
  useQuery({
    queryKey: ['admin', 'trackers', 'detail', id],
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminTrackerDetail>>(`/admin/trackers/${id}`)).data.data,
    enabled: Boolean(id),
  });
export const useDeleteAdminTracker = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/trackers/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'trackers'] }),
  });
};
export const useAdminPublishedTrackers = (query: AdminListQuery) =>
  useQuery({
    queryKey: ['admin', 'trackers', 'published', query],
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminPublishedTracker>>>(
          '/admin/trackers/published',
          { params: query }
        )
      ).data.data,
    placeholderData: keepPreviousData,
  });
export const useLikeAdminPublishedTracker = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/admin/trackers/published/${id}/like`),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'trackers', 'published'] }),
  });
};
export const useRateAdminPublishedTracker = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      api.put(`/admin/trackers/published/${id}/rating`, { rating }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'trackers', 'published'] }),
  });
};
