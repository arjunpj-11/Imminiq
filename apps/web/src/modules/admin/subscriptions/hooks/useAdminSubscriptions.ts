import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../shared';
import type {
  AdminPlanLimits,
  AdminSubscriptionOverview,
} from '../types/admin-subscriptions.types';
import {
  adminSubscriptionsKeys,
  type AdminSubscriptionsQuery,
} from './admin-subscriptions.query-keys';

export const useAdminSubscriptions = (query: AdminSubscriptionsQuery) =>
  useQuery({
    queryKey: adminSubscriptionsKeys.overview(query),
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
    onSuccess: () => client.invalidateQueries({ queryKey: adminSubscriptionsKeys.all }),
  });
};
