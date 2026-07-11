// apps/web/src/modules/trackers/hooks/useSubmitTrackerForVerification.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'

import api from '../../../lib/axios'
import type {
  IApiResponse,
  ITracker,
  ITrackerListResponse,
} from '../types/tracker.types'
import { trackerKeys } from './useTrackers'

export type SubmitTrackerForVerificationPayload = {
  trackerId: string
  requiredVotes?: number
  durationHours?: number
  urgent?: boolean
}

export type TrackerVerificationSubmission = {
  _id: string
  trackerId: string
  ownerId: string
  title: string
  category: string
  excerpt: string
  progress: number
  passVotes: number
  failVotes: number
  requiredVotes: number
  closed: boolean
  urgent: boolean
  timeLeft: string
}

export type SubmitTrackerForVerificationResponse = {
  submission: TrackerVerificationSubmission
}

type TrackerWithVerificationStatus = ITracker & {
  verificationStatus?: 'pending' | 'verified' | 'rejected' | null
}

type TrackerListWithVerificationStatus = ITrackerListResponse & {
  trackers: TrackerWithVerificationStatus[]
}

const markTrackerVerificationPending = (
  tracker: ITracker,
  trackerId: string,
): TrackerWithVerificationStatus => {
  if (tracker._id !== trackerId) {
    return tracker
  }

  return {
    ...tracker,
    verificationStatus: 'pending',
  }
}

export const useSubmitTrackerForVerification = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IApiResponse<SubmitTrackerForVerificationResponse>,
    Error,
    SubmitTrackerForVerificationPayload
  >({
    mutationFn: async ({
      trackerId,
      requiredVotes = 10,
      durationHours = 24,
      urgent = false,
    }) => {
      const response = await api.post<
        IApiResponse<SubmitTrackerForVerificationResponse>
      >(`/community/trackers/${trackerId}/verification`, {
        requiredVotes,
        durationHours,
        urgent,
      })

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.setQueriesData<TrackerListWithVerificationStatus>(
        {
          queryKey: trackerKeys.lists(),
        },
        (oldData) => {
          if (!oldData?.trackers) {
            return oldData
          }

          return {
            ...oldData,
            trackers: oldData.trackers.map((tracker) =>
              markTrackerVerificationPending(tracker, variables.trackerId),
            ),
          }
        },
      )

      queryClient.setQueryData<TrackerWithVerificationStatus>(
        trackerKeys.detail(variables.trackerId),
        (oldData) => {
          if (!oldData) {
            return oldData
          }

          return {
            ...oldData,
            verificationStatus: 'pending',
          }
        },
      )
    },
  })
}