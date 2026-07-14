import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../../lib/axios';
import { PROFILE_API_PATHS } from '../../constants/profile-api.constants';
import { useAuthStore } from '../../../../../store/useAuthStore';
import type {
  IApiErrorResponse,
  IApiResponse,
  IProfileImageUploadResponse,
} from '../../types/profile.types';
import { profileQueryKeys } from '../profile.query-keys';

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    IApiResponse<IProfileImageUploadResponse>,
    AxiosError<IApiErrorResponse>,
    File
  >({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<IApiResponse<IProfileImageUploadResponse>>(
        PROFILE_API_PATHS.avatar,
        formData
      );

      return response.data;
    },
    onSuccess: (response) => {
      if (user) {
        setUser({
          ...user,
          avatarUrl: response.data.fileUrl,
        });
      }

      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me(),
      });
    },
  });
};
