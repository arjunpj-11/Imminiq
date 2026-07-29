import { useMutation } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { TRACKER_CREATION_API_PATHS } from '../constants/tracker-creation.constants';
import type { ITrackerIntakeMessage, ITrackerIntakeProfile } from '../types/tracker-creation.types';

interface ITrackerIntakeApiResponse {
  success: boolean;
  message: string;
  data: {
    assistantMessage: string;
    isComplete: boolean;
    profile?: ITrackerIntakeProfile;
  };
}

export const useTrackerIntake = () =>
  useMutation({
    mutationFn: async (messages: ITrackerIntakeMessage[]) => {
      const response = await api.post<ITrackerIntakeApiResponse>(
        TRACKER_CREATION_API_PATHS.trackerIntake,
        {
          messages,
        }
      );
      return response.data.data;
    },
  });
