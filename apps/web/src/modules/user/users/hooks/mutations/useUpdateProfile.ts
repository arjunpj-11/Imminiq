import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../../lib/axios';
import { PROFILE_API_PATHS } from '../../constants/profile-api.constants';
import type {
  IApiErrorResponse,
  IApiResponse,
  IGetMyProfileResponse,
  IUpdateProfilePayload,
} from '../../types/profile.types';
import { profileQueryKeys } from '../profile.query-keys';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiResponse<IGetMyProfileResponse>,
    AxiosError<IApiErrorResponse>,
    IUpdateProfilePayload
  >({
    mutationFn: async (payload) => {
      const response = await api.patch<IApiResponse<IGetMyProfileResponse>>(
        PROFILE_API_PATHS.me,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me(),
      });

      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.stats(),
      });
    },
  });
};
