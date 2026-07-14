import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminSubscriptionPlanInput } from '../types/admin-subscriptions.types';
import { ADMIN_SUBSCRIPTIONS_ENDPOINTS } from '../constants/admin-subscriptions.constants';
import { adminSubscriptionsKeys } from './admin-subscriptions.query-keys';

export const useUpdateAdminPlan = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: AdminSubscriptionPlanInput }) =>
      api.put(ADMIN_SUBSCRIPTIONS_ENDPOINTS.plan(planId), input),
    onSuccess: () => client.invalidateQueries({ queryKey: adminSubscriptionsKeys.all }),
  });
};
