import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../lib/axios';
import { TRACKER_CREATION_API_PATHS } from '../constants/tracker-creation.constants';

export interface ISaveTrackerGoalPayload {
  topic: string;
  goal?: string;
  preferredLanguage: string;
}

export interface ISaveTrackerGoalResponse {
  success?: boolean;
  message: string;
  data?: {
    _id?: string;
    userId?: string;
    preparingFor?: string;
    goal?: string;
    preferredLanguage?: string;
    completedStep?: number;
    isCompleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
}

interface IApiErrorResponse {
  success?: boolean;
  message?: string;
}

const saveTrackerGoal = async (
  payload: ISaveTrackerGoalPayload
): Promise<ISaveTrackerGoalResponse> => {
  const response = await api.post<ISaveTrackerGoalResponse>(
    TRACKER_CREATION_API_PATHS.stepOne,
    payload
  );

  return response.data;
};

export const useSaveTrackerGoal = () => {
  return useMutation<
    ISaveTrackerGoalResponse,
    AxiosError<IApiErrorResponse>,
    ISaveTrackerGoalPayload
  >({
    mutationFn: saveTrackerGoal,
  });
};
