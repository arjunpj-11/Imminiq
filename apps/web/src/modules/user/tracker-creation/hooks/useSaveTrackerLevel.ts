import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../lib/axios';
import { TRACKER_CREATION_API_PATHS } from '../constants/tracker-creation.constants';

export type TrackerCreationLevel = 'beginner' | 'intermediate' | 'advanced';

interface ISaveTrackerLevelPayload {
  level: TrackerCreationLevel;
}

interface ISaveTrackerLevelResponse {
  success: boolean;
  message: string;
  data?: {
    onboardingSessionId?: string;
    completedStep?: number;
    nextStep?: string;
    readyToGenerate?: boolean;
  };
}

interface IApiErrorResponse {
  success?: boolean;
  message?: string;
}

export const useSaveTrackerLevel = () => {
  return useMutation<
    ISaveTrackerLevelResponse,
    AxiosError<IApiErrorResponse>,
    ISaveTrackerLevelPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post<ISaveTrackerLevelResponse>(
        TRACKER_CREATION_API_PATHS.stepTwo,
        payload
      );

      return response.data;
    },
  });
};
