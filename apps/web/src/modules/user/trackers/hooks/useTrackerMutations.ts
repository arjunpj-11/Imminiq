import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { TRACKER_API_PATHS } from '../constants/tracker-api.constants';
import { communityKeys } from '../../community';
import type {
  IApiResponse,
  ICreateSubtopicPayload,
  ICreateTopicPayload,
  ICreateTrackerPayload,
  PublishTrackerPayload,
  ITracker,
  IUpdateSubtopicProgressPayload,
  IUpdateTrackerPayload,
} from '../types/tracker.types';
import { trackerKeys } from './trackers.query-keys';

export const useCreateTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, ICreateTrackerPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<IApiResponse<ITracker>>(TRACKER_API_PATHS.root, payload);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

export const useUpdateTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, IUpdateTrackerPayload>({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response = await api.patch<IApiResponse<ITracker>>(
        TRACKER_API_PATHS.detail(trackerId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });
    },
  });
};

export const useDeleteTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.delete<IApiResponse<ITracker>>(
        TRACKER_API_PATHS.detail(trackerId)
      );

      return response.data;
    },

    onSuccess: (_response, trackerId) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
      queryClient.removeQueries({
        queryKey: trackerKeys.detail(trackerId),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.all,
      });
    },
  });
};

export const useArchiveTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<IApiResponse<ITracker>>(TRACKER_API_PATHS.archive(trackerId));

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

export const useRestoreTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<IApiResponse<ITracker>>(TRACKER_API_PATHS.restore(trackerId));

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

export const usePublishTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, PublishTrackerPayload>({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response = await api.post<IApiResponse<ITracker>>(
        TRACKER_API_PATHS.publish(trackerId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });
    },
  });
};

export const useUnpublishTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<IApiResponse<ITracker>>(
        TRACKER_API_PATHS.unpublish(trackerId)
      );

      return response.data;
    },

    onSuccess: (_response, trackerId) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(trackerId),
      });
    },
  });
};

export const useCreateTrackerTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<unknown>, Error, ICreateTopicPayload>({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response = await api.post<IApiResponse<unknown>>(
        TRACKER_API_PATHS.topics(trackerId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

export const useCreateTrackerSubtopic = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<unknown>, Error, ICreateSubtopicPayload>({
    mutationFn: async ({ trackerId, topicId, ...payload }) => {
      const response = await api.post<IApiResponse<unknown>>(
        TRACKER_API_PATHS.subtopics(trackerId, topicId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

export const useUpdateSubtopicProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<unknown>, Error, IUpdateSubtopicProgressPayload>({
    mutationFn: async ({ trackerId, subtopicId, ...payload }) => {
      const response = await api.patch<IApiResponse<unknown>>(
        TRACKER_API_PATHS.subtopicProgress(trackerId, subtopicId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.lesson(variables.trackerId, variables.subtopicId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.lists(),
      });
    },
  });
};
