import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { CALL_ENDPOINTS } from '../constants/calls.constants';
import type {
  CallType,
  ICall,
  ICallApiError,
  ICallApiResponse,
  ICallPage,
} from '../types/call.types';
import { socialQueryKeys } from './social.query-keys';

export const useActiveCall = (enabled = true) =>
  useQuery<ICall | null, AxiosError<ICallApiError>>({
    queryKey: socialQueryKeys.calls.active(),
    queryFn: async () => {
      const response = await api.get<ICallApiResponse<ICall | null>>(CALL_ENDPOINTS.active);
      return response.data.data;
    },
    enabled,
    retry: false,
    staleTime: 5_000,
  });

export const useCallHistory = (limit: number, enabled = true) =>
  useInfiniteQuery<ICallPage, AxiosError<ICallApiError>>({
    queryKey: socialQueryKeys.calls.history(limit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.get<ICallApiResponse<ICallPage>>(CALL_ENDPOINTS.root, {
        params: { page: pageParam, limit },
      });
      return response.data.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled,
    staleTime: 20_000,
  });

export const useInitiateCall = () => {
  const client = useQueryClient();
  return useMutation<
    ICall,
    AxiosError<ICallApiError>,
    { calleeUserId: string; type: CallType; reason: string }
  >({
    mutationFn: async (input) => {
      const response = await api.post<ICallApiResponse<ICall>>(CALL_ENDPOINTS.root, input);
      return response.data.data;
    },
    onSuccess: (call) =>
      client.setQueryData(socialQueryKeys.calls.active(), call),
  });
};

export const useRespondCall = () => {
  const client = useQueryClient();
  return useMutation<
    ICall,
    AxiosError<ICallApiError>,
    { callId: string; response: 'accept' | 'decline' }
  >({
    mutationFn: async ({ callId, response: callResponse }) => {
      const response = await api.patch<ICallApiResponse<ICall>>(
        CALL_ENDPOINTS.respond(callId),
        { response: callResponse }
      );
      return response.data.data;
    },
    onSuccess: (call) =>
      client.setQueryData(socialQueryKeys.calls.active(), call),
  });
};

export const useEndCall = () => {
  const client = useQueryClient();
  return useMutation<
    ICall,
    AxiosError<ICallApiError>,
    { callId: string; outcome: 'ended' | 'missed' | 'cancelled' }
  >({
    mutationFn: async ({ callId, outcome }) => {
      const response = await api.patch<ICallApiResponse<ICall>>(CALL_ENDPOINTS.end(callId), {
        outcome,
      });
      return response.data.data;
    },
    onSuccess: (call) =>
      client.setQueryData(socialQueryKeys.calls.active(), call),
  });
};
