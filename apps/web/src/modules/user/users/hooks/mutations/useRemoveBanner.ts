import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../../lib/axios';
import { PROFILE_API_PATHS } from '../../constants/profile-api.constants';
import type {
  IApiErrorResponse,
  IApiResponse,
  IRemoveBannerResponse,
} from '../../types/profile.types';
import { profileQueryKeys } from '../profile.query-keys';

export const useRemoveBanner = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<IRemoveBannerResponse>, AxiosError<IApiErrorResponse>, void>({
    mutationFn: async () => {
      const response = await api.delete<IApiResponse<IRemoveBannerResponse>>(
        PROFILE_API_PATHS.banner
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me(),
      });
    },
  });
};
