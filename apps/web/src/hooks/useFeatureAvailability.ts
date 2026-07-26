import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiEnvelope } from '../lib/api.types';
import api from '../lib/axios';
import { type FeatureAvailability, type FeatureKey } from '../config/feature-availability';

export const featureAvailabilityQueryKey = ['feature-availability'] as const;

export const useFeatureAvailability = (enabled = true) =>
  useQuery({
    queryKey: featureAvailabilityQueryKey,
    queryFn: async () =>
      (await api.get<ApiEnvelope<FeatureAvailability>>('/feature-availability')).data.data,
    enabled,
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

export const useFeatureEnabled = (feature: FeatureKey, enabled = true) => {
  const query = useFeatureAvailability(enabled);
  return {
    ...query,
    enabled: query.data?.[feature] ?? false,
  };
};

export const useSetFeatureAvailability = () => {
  const queryClient = useQueryClient();
  return (features: FeatureAvailability) => {
    queryClient.setQueryData(featureAvailabilityQueryKey, features);
  };
};
