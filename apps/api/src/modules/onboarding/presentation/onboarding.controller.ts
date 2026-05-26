import {
  Request,
  Response,
  NextFunction,
} from 'express'

import { onboardingService } from '../onboarding.service'
import { ApiResponse } from '../../../shared/utils/ApiResponse'

type JobIdParams = {
  jobId: string
}

export const onboardingController = {
  getStatus: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const status =
        await onboardingService.getStatus(
          req.user!.userId
        )

      res.json(
        new ApiResponse(
          'Onboarding status',
          status
        )
      )
    } catch (error) {
      next(error)
    }
  },

  saveStep1: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { topic, goal } = req.body

      const data =
        await onboardingService.saveStep1(
          req.user!.userId,
          topic,
          goal
        )

      res.json(
        new ApiResponse(
          'Step 1 saved',
          data
        )
      )
    } catch (error) {
      next(error)
    }
  },

  saveStep2: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { level } = req.body

      const data =
        await onboardingService.saveStep2(
          req.user!.userId,
          level
        )

      res.json(
        new ApiResponse(
          'Step 2 saved',
          data
        )
      )
    } catch (error) {
      next(error)
    }
  },

  generateRoadmap: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        topic,
        goal,
        level,
      } = req.body

      const result =
        await onboardingService.generateRoadmap(
          req.user!.userId,
          topic,
          goal,
          level
        )

      res.status(202).json(
        new ApiResponse(
          'Roadmap generation started',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getJobStatus: async (
    req: Request<JobIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const status =
        await onboardingService.getJobStatus(
          req.params.jobId,
          req.user!.userId
        )

      res.json(
        new ApiResponse(
          'Job status',
          status
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getJobResult: async (
    req: Request<JobIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await onboardingService.getJobResult(
          req.params.jobId,
          req.user!.userId
        )

      res.json(
        new ApiResponse(
          'Roadmap ready',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  evaluateRoadmap: async (
    req: Request<JobIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await onboardingService.evaluateRoadmap(
          req.params.jobId,
          req.user!.userId
        )

      res.status(202).json(
        new ApiResponse(
          'Roadmap evaluation started',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getEvaluationResult: async (
    req: Request<JobIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await onboardingService.getEvaluationResult(
          req.params.jobId,
          req.user!.userId
        )

      res.json(
        new ApiResponse(
          'Roadmap evaluation ready',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },
}
