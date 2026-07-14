import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import type {
  SubscriptionBillingCycle,
  SubscriptionOrder,
  SubscriptionPlan,
  UserSubscription,
} from '../types/subscription.types';

export const useSubscriptionPlans = () =>
  useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async () =>
      (await api.get<ApiEnvelope<SubscriptionPlan[]>>('/subscriptions/plans')).data.data,
  });

export const useCurrentSubscription = () =>
  useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: async () =>
      (await api.get<ApiEnvelope<UserSubscription | null>>('/subscriptions/me')).data.data,
  });

export const useCreateSubscriptionOrder = () =>
  useMutation({
    mutationFn: (input: {
      planId: 'pro' | 'premium';
      billingCycle: SubscriptionBillingCycle;
    }) =>
      api
        .post<ApiEnvelope<SubscriptionOrder>>('/subscriptions/orders', input)
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
        .post<ApiEnvelope<UserSubscription>>('/subscriptions/verify', input)
        .then((response) => response.data.data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
};
