import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminPlanLimits } from '../types/admin-subscriptions.types';
import { ADMIN_SUBSCRIPTIONS_ENDPOINTS } from '../constants/admin-subscriptions.constants';
import { adminSubscriptionsKeys } from './admin-subscriptions.query-keys';

export const useUpdateAdminPlanLimits = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, limits }: { planId: string; limits: AdminPlanLimits }) =>
      api.put(ADMIN_SUBSCRIPTIONS_ENDPOINTS.planLimits(planId), limits),
    onSuccess: () => client.invalidateQueries({ queryKey: adminSubscriptionsKeys.all }),
  });
};
