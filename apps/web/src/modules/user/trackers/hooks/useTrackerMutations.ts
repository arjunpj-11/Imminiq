import { useMutation, useQueryClient } from '@tanstack/react-query'

import api from '../../../../lib/axios'
import type {
  IApiResponse,
  ICreateSubtopicPayload,
  ICreateTopicPayload,
  ICreateTrackerPayload,
  PublishTrackerPayload,
  ITracker,
  IUpdateSubtopicProgressPayload,
  IUpdateTrackerPayload,
} from '../types/tracker.types'
import { trackerKeys } from './tracker.keys'

export const useCreateTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<ITracker>, Error, ICreateTrackerPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<IApiResponse<ITracker>>(
        '/trackers',
        payload
      )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useUpdateTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<ITracker>, Error, IUpdateTrackerPayload>({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response = await api.patch<IApiResponse<ITracker>>(
        `/trackers/${trackerId}`,
        payload
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })
    },
  })
}

export const useDeleteTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.delete<IApiResponse<ITracker>>(
        `/trackers/${trackerId}`
      )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useArchiveTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<IApiResponse<ITracker>>(
        `/trackers/${trackerId}/archive`
      )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useRestoreTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<IApiResponse<ITracker>>(
        `/trackers/${trackerId}/restore`
      )

      return response.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const usePublishTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IApiResponse<ITracker>,
    Error,
    PublishTrackerPayload
  >({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response = await api.post<IApiResponse<ITracker>>(
        `/trackers/${trackerId}/publish`,
        payload
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.summary(),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })
    },
  })
}

export const useUnpublishTracker = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<IApiResponse<ITracker>>(
        `/trackers/${trackerId}/unpublish`
      )

      return response.data
    },

    onSuccess: (_response, trackerId) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(trackerId),
      })
    },
  })
}

export const useCreateTrackerTopic = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<unknown>, Error, ICreateTopicPayload>({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response = await api.post<IApiResponse<unknown>>(
        `/trackers/${trackerId}/topics`,
        payload
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useCreateTrackerSubtopic = () => {
  const queryClient = useQueryClient()

  return useMutation<IApiResponse<unknown>, Error, ICreateSubtopicPayload>({
    mutationFn: async ({ trackerId, topicId, ...payload }) => {
      const response = await api.post<IApiResponse<unknown>>(
        `/trackers/${trackerId}/topics/${topicId}/subtopics`,
        payload
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      })
    },
  })
}

export const useUpdateSubtopicProgress = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IApiResponse<unknown>,
    Error,
    IUpdateSubtopicProgressPayload
  >({
    mutationFn: async ({ trackerId, subtopicId, ...payload }) => {
      const response = await api.patch<IApiResponse<unknown>>(
        `/trackers/${trackerId}/subtopics/${subtopicId}/progress`,
        payload
      )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.lesson(variables.trackerId, variables.subtopicId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.summary(),
      })

      queryClient.invalidateQueries({
        queryKey: trackerKeys.lists(),
      })
    },
  })
}

