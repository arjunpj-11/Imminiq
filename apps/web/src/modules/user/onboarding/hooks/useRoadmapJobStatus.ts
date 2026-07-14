import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../../../lib/axios';

export type RoadmapJobTerminalStatus = 'completed' | 'failed' | 'success' | 'done' | 'error';

export interface IRoadmapJobStatusData {
  jobId?: string;
  status?: string;
  state?: string;

  progress?: number;
  progressPercent?: number;
  percentage?: number;

  currentStep?: number;
  step?: number;
  completedSteps?: number;
  completedStep?: number;
  totalSteps?: number;

  stepLabel?: string;
  currentStepLabel?: string;
  progressLabel?: string;

  message?: string;
  logMessage?: string;
  engineLabel?: string;
  nextLabel?: string;
  nextStep?: string;
  testId?: string | null;
  trackerId?: string | null;
  errorMessage?: string | null;
}

interface IRoadmapJobStatusResponse {
  success: boolean;
  message: string;
  data?: IRoadmapJobStatusData;
}

interface IApiErrorResponse {
  success?: boolean;
  message?: string;
}

const isTerminalJob = (data?: IRoadmapJobStatusData) => {
  const status = (data?.status || data?.state || '').toLowerCase();

  return ['completed', 'failed', 'success', 'done', 'error'].includes(status);
};

export const useRoadmapJobStatus = (jobId?: string) => {
  return useQuery<IRoadmapJobStatusResponse, AxiosError<IApiErrorResponse>>({
    queryKey: ['roadmap-job-status', jobId],

    queryFn: async () => {
      const response = await api.get<IRoadmapJobStatusResponse>(`/onboarding/jobs/${jobId}/status`);

      return response.data;
    },

    enabled: Boolean(jobId),

    refetchInterval: (query) => {
      const response = query.state.data;

      if (isTerminalJob(response?.data)) {
        return false;
      }

      return 1500;
    },

    refetchOnWindowFocus: false,
    retry: 1,
  });
};
