import type { NextFunction, Request, Response } from 'express'

import type {
  IDashboardActivityIntensityQueryDTO,
  IDashboardRecentItemsQueryDTO,
} from '../application/dashboard.dto'
import type { DashboardUseCases } from '../application/dashboard-use-cases.contract'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'

export class DashboardController {
  constructor(private readonly _useCases: DashboardUseCases) {}

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this._useCases.getDashboardSummary.execute(userId)

      res.json(new ApiResponse('Dashboard fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getCurrentRoadmap = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this._useCases.getCurrentRoadmap.execute(userId)

      res.json(new ApiResponse('Current roadmap fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getActivityIntensity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const query = res.locals
        .dashboardActivityIntensityQuery as IDashboardActivityIntensityQueryDTO

      const data = await this._useCases.getActivityIntensity.execute(
        userId,
        query.months
      )

      res.json(new ApiResponse('Activity intensity fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getRecentBattles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const query = res.locals
        .dashboardRecentItemsQuery as IDashboardRecentItemsQueryDTO

      const data = await this._useCases.getRecentBattles.execute(userId, query.limit)

      res.json(new ApiResponse('Recent battles fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getFriendsHub = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const query = res.locals
        .dashboardRecentItemsQuery as IDashboardRecentItemsQueryDTO

      const data = await this._useCases.getFriendsHub.execute(userId, query.limit)

      res.json(new ApiResponse('Friends hub fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getRecommendedActions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this._useCases.getRecommendedActions.execute(userId)

      res.json(new ApiResponse('Recommended actions fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getAIInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this._useCases.getAIInsights.execute(userId)

      res.json(new ApiResponse('AI insights fetched', data))
    } catch (error) {
      next(error)
    }
  }
}
