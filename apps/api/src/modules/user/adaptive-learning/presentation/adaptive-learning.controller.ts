import type { NextFunction, Request, Response } from 'express'

import { ApiResponse } from '../../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../../shared/utils/getAuthUser'
import type { AdaptiveLearningUseCases } from '../application/adaptive-learning-use-cases.contract'

export class AdaptiveLearningController {
  constructor(private readonly _useCases: AdaptiveLearningUseCases) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getDashboard.execute(
        getAuthUser(req).userId,
      )
      res.json(new ApiResponse('Adaptive learning dashboard fetched', data))
    } catch (error) {
      next(error)
    }
  }

  generateAssessment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = await this._useCases.generateAssessment.execute(
        getAuthUser(req).userId,
      )
      res.status(202).json(new ApiResponse('Adaptive exam generation started', data))
    } catch (error) {
      next(error)
    }
  }

  chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.chatWithAdvisor.execute(
        getAuthUser(req).userId,
        req.body.question,
      )
      res.json(new ApiResponse('Advisor response generated', data))
    } catch (error) {
      next(error)
    }
  }

  clearChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this._useCases.clearAdvisorChat.execute(getAuthUser(req).userId)
      res.json(new ApiResponse('Advisor chat cleared', null))
    } catch (error) {
      next(error)
    }
  }
}
