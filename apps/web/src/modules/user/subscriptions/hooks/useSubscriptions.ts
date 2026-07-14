import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { SUBSCRIPTION_API_PATHS } from '../constants/subscriptions.constants';
import { subscriptionKeys } from './subscriptions.query-keys';
import type { ApiEnvelope } from '../../../../lib/api.types';
import type {
  SubscriptionBillingCycle,
  SubscriptionOrder,
  SubscriptionPlan,
  UserSubscription,
} from '../types/subscription.types';

export const useSubscriptionPlans = () =>
  useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: async () =>
      (await api.get<ApiEnvelope<SubscriptionPlan[]>>(SUBSCRIPTION_API_PATHS.plans)).data.data,
  });

export const useCurrentSubscription = () =>
  useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: async () =>
      (await api.get<ApiEnvelope<UserSubscription | null>>(SUBSCRIPTION_API_PATHS.current)).data
        .data,
  });

export const useCreateSubscriptionOrder = () =>
  useMutation({
    mutationFn: (input: { planId: 'pro' | 'premium'; billingCycle: SubscriptionBillingCycle }) =>
      api
        .post<ApiEnvelope<SubscriptionOrder>>(SUBSCRIPTION_API_PATHS.orders, input)
        .then((response) => response.data.data),
  });

export const useVerifySubscriptionPayment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) =>
      api
        .post<ApiEnvelope<UserSubscription>>(SUBSCRIPTION_API_PATHS.verify, input)
        .then((response) => response.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: subscriptionKeys.all }),
  });
};
