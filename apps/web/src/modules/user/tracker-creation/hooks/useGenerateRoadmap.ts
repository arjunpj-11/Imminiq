import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../lib/axios';
import { TRACKER_CREATION_API_PATHS } from '../constants/tracker-creation.constants';
import type { TrackerCreationLevel } from './useSaveTrackerLevel';

interface IGenerateRoadmapPayload {
  topic: string;
  goal?: string;
  level: TrackerCreationLevel;
  preferredLanguage: string;
}

interface IGenerateRoadmapResponse {
  success: boolean;
  message: string;
  data?: {
    jobId?: string;
  };
}

interface IApiErrorResponse {
  success?: boolean;
  message?: string;
}

export const useGenerateRoadmap = () => {
  return useMutation<
    IGenerateRoadmapResponse,
    AxiosError<IApiErrorResponse>,
    IGenerateRoadmapPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post<IGenerateRoadmapResponse>(
        TRACKER_CREATION_API_PATHS.generateRoadmap,
        payload
      );

      return response.data;
    },
  });
};
