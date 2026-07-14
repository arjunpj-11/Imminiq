// apps/web/src/hooks/onboarding/useSaveOnboardingStepOne.ts

import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../lib/axios';
import { ONBOARDING_API_PATHS } from '../constants/onboarding.constants';

export interface ISaveOnboardingStepOnePayload {
  topic: string;
  goal?: string;
}

export interface ISaveOnboardingStepOneResponse {
  success?: boolean;
  message: string;
  data?: {
    _id?: string;
    userId?: string;
    preparingFor?: string;
    goal?: string;
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

const saveOnboardingStepOne = async (
  payload: ISaveOnboardingStepOnePayload
): Promise<ISaveOnboardingStepOneResponse> => {
  const response = await api.post<ISaveOnboardingStepOneResponse>(ONBOARDING_API_PATHS.stepOne, payload);

  return response.data;
};

export const useSaveOnboardingStepOne = () => {
  return useMutation<
    ISaveOnboardingStepOneResponse,
    AxiosError<IApiErrorResponse>,
    ISaveOnboardingStepOnePayload
  >({
    mutationFn: saveOnboardingStepOne,
  });
};
