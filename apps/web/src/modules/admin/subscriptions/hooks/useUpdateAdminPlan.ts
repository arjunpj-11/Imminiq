import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import type {
  AdminSubscriptionPlan,
  AdminSubscriptionPlanUpdateInput,
} from '../types/admin-subscriptions.types';
import { ADMIN_SUBSCRIPTIONS_ENDPOINTS } from '../constants/admin-subscriptions.constants';
import { adminSubscriptionsKeys } from './admin-subscriptions.query-keys';

export const useUpdateAdminPlan = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, input }: { planId: string; input: AdminSubscriptionPlanUpdateInput }) =>
      (await api.put<ApiEnvelope<AdminSubscriptionPlan>>(ADMIN_SUBSCRIPTIONS_ENDPOINTS.plan(planId), input)).data.data,
    onMutate: ({ planId }) => ({
      toastId: toast.loading(`Saving ${planId} plan…`, 'Validating the plan and selected subscriber upgrades.'),
    }),
    onSuccess: async (_plan, { planId, input }, context) => {
      toast.update(context.toastId, {
        title: `${planId} plan saved`,
        description: input.propagateLimitFields.length
          ? `${input.propagateLimitFields.length} selected field${input.propagateLimitFields.length === 1 ? '' : 's'} evaluated; only eligible subscriber upgrades were applied.`
          : 'The new plan will be used for future purchases.',
        tone: 'success',
      });
      await client.invalidateQueries({ queryKey: adminSubscriptionsKeys.all });
    },
    onError: (error, _variables, context) => {
      if (!context) return;
      toast.update(context.toastId, {
        title: 'Plan could not be saved',
        description: getUserFacingError(error, 'Please review the plan values and try again.'),
        tone: 'error',
        duration: 5600,
      });
    },
  });
};
