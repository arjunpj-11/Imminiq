// apps/api/src/modules/trackers/trackers.controller.ts

import {
  Request,
  Response,
  NextFunction,
} from 'express'

import { trackerService } from './trackers.service'
import { ApiResponse } from '../../shared/utils/ApiResponse'

type AddMissingTopicParams = {
  trackerId: string
  evaluationJobId: string
  topicIndex: string
}

export const trackerController = {
  addMissingEvaluationTopic: async (
    req: Request<AddMissingTopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await trackerService.addMissingEvaluationTopic({
          trackerId: req.params.trackerId,

          evaluationJobId:
            req.params.evaluationJobId,

          topicIndex: req.params.topicIndex,

          userId: req.user!.userId,
        })

      res.status(201).json(
        new ApiResponse(
          'Missing topic added to tracker',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },
}