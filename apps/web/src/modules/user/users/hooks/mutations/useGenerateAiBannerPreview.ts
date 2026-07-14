import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../../lib/axios';
import { PROFILE_API_PATHS } from '../../constants/profile-api.constants';

interface IGenerateAiBannerPreviewPayload {
  prompt: string;
}

interface IGenerateAiBannerPreviewResponse {
  success: boolean;
  message: string;
  data?: {
    imageUrl: string;
  };
}

interface IApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
}

export const useGenerateAiBannerPreview = () => {
  return useMutation<
    IGenerateAiBannerPreviewResponse,
    AxiosError<IApiErrorResponse>,
    IGenerateAiBannerPreviewPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post<IGenerateAiBannerPreviewResponse>(
        PROFILE_API_PATHS.bannerAiPreview,
        payload
      );

      return response.data;
    },
  });
};
