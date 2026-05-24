import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import api from '../../../lib/axios'

type AddMissingEvaluationTopicPayload = {
  trackerId: string
  evaluationJobId: string
  topicIndex: number
}

type AddedSubtopic = {
  _id: string
  trackerId: string
  topicId: string
  parentSubtopicId: string | null
  title: string
  description: string
  order: number
  depth: number
}

type AddMissingEvaluationTopicResponse = {
  success: boolean
  message: string
  data: {
    trackerId: string
    evaluationJobId: string
    missingTopicIndex: number
    addedSubtopic: AddedSubtopic
    placedUnder: {
      type: 'topic' | 'subtopic'
      _id: string
      title: string
    }
  }
}

export const useAddMissingEvaluationTopic = () => {
  const queryClient = useQueryClient()

  return useMutation<
    AddMissingEvaluationTopicResponse,
    Error,
    AddMissingEvaluationTopicPayload
  >({
    mutationFn: async ({
      trackerId,
      evaluationJobId,
      topicIndex,
    }) => {
      const response =
        await api.post<AddMissingEvaluationTopicResponse>(
          `/trackers/${trackerId}/evaluation-jobs/${evaluationJobId}/missing-topics/${topicIndex}/add`
        )

      return response.data
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'roadmap-evaluation-result',
          variables.evaluationJobId,
        ],
      })
    },
  })
}