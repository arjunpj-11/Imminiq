import type { NextFunction, Request, Response } from 'express'

import { HttpStatusCode } from '../../../shared/constants/http-status-code.enum'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import {
  onboardingService,
  type OnboardingService,
} from '../onboarding.service'

type JobIdParams = {
  jobId: string
}

export class OnboardingController {
  constructor(private readonly _service: OnboardingService) {}

  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await this._service.getStatus(getAuthUser(req).userId)

      res.json(new ApiResponse('Onboarding status', status))
    } catch (error) {
      next(error)
    }
  }

  saveStep1 = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._service.saveStep1(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Step 1 saved', data))
    } catch (error) {
      next(error)
    }
  }

  saveStep2 = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._service.saveStep2(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Step 2 saved', data))
    } catch (error) {
      next(error)
    }
  }

  generateRoadmap = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._service.generateRoadmap(
        getAuthUser(req).userId,
        req.body
      )

      res
        .status(HttpStatusCode.ACCEPTED)
        .json(new ApiResponse('Roadmap generation started', result))
    } catch (error) {
      next(error)
    }
  }

  getJobStatus = async (
    req: Request<JobIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const status = await this._service.getJobStatus(
        req.params.jobId,
        getAuthUser(req).userId
      )

      res.json(new ApiResponse('Job status', status))
    } catch (error) {
      next(error)
    }
  }

  getJobResult = async (
    req: Request<JobIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._service.getJobResult(
        req.params.jobId,
        getAuthUser(req).userId
      )

      res.json(new ApiResponse('Roadmap ready', result))
    } catch (error) {
      next(error)
    }
  }

  evaluateRoadmap = async (
    req: Request<JobIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._service.evaluateRoadmap(
        req.params.jobId,
        getAuthUser(req).userId
      )

      res
        .status(HttpStatusCode.ACCEPTED)
        .json(new ApiResponse('Roadmap evaluation started', result))
    } catch (error) {
      next(error)
    }
  }

  getEvaluationResult = async (
    req: Request<JobIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._service.getEvaluationResult(
        req.params.jobId,
        getAuthUser(req).userId
      )

      res.json(new ApiResponse('Roadmap evaluation ready', result))
    } catch (error) {
      next(error)
    }
  }
}

export const onboardingController = new OnboardingController(onboardingService)