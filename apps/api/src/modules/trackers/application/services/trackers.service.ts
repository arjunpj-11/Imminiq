import { mongoTrackerRepository } from '../../infrastructure/repositories/mongo-tracker.repository'
import type { AddMissingEvaluationTopicInput } from '../../domain/types/trackers.types'
import { AddMissingEvaluationTopicUseCase } from '../use-cases/add-missing-evaluation-topic.usecase'

const addMissingEvaluationTopicUseCase =
  new AddMissingEvaluationTopicUseCase(
    mongoTrackerRepository
  )

export const trackerService = {
  addMissingEvaluationTopic: async (
    input: AddMissingEvaluationTopicInput
  ) => {
    return addMissingEvaluationTopicUseCase.execute(input)
  },
}
