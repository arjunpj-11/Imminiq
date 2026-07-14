import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../admin-api.types';
import type {
  AdminPlanLimits,
  AdminSubscriptionOverview,
} from '../types/admin-subscriptions.types';

export const useAdminSubscriptions = (query: {
  search?: string;
  status?: string;
  page?: number;
}) =>
  useQuery({
    queryKey: ['admin', 'subscriptions', query],
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminSubscriptionOverview>>('/admin/subscriptions', {
          params: query,
        })
      ).data.data,
  });

export const useUpdateAdminPlanLimits = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, limits }: { planId: string; limits: AdminPlanLimits }) =>
      api.put(`/admin/subscriptions/plans/${planId}/limits`, limits),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'subscriptions'] }),
  });
};
