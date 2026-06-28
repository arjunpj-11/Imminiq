import type { NextFunction, Request, Response } from 'express'

import type {
  DashboardActivityIntensityQuery,
  DashboardRecentItemsQuery,
} from '../application/dtos/dashboard.dto'
import { dashboardService, type DashboardService } from '../dashboard.service'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'

export class DashboardController {
  constructor(private readonly _service: DashboardService) {}

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this._service.getSummary(userId)

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
      const data = await this._service.getCurrentRoadmap(userId)

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
        .dashboardActivityIntensityQuery as DashboardActivityIntensityQuery

      const data = await this._service.getActivityIntensity(
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
        .dashboardRecentItemsQuery as DashboardRecentItemsQuery

      const data = await this._service.getRecentBattles(userId, query.limit)

      res.json(new ApiResponse('Recent battles fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getFriendsHub = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const query = res.locals
        .dashboardRecentItemsQuery as DashboardRecentItemsQuery

      const data = await this._service.getFriendsHub(userId, query.limit)

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
      const data = await this._service.getRecommendedActions(userId)

      res.json(new ApiResponse('Recommended actions fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getAIInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this._service.getAIInsights(userId)

      res.json(new ApiResponse('AI insights fetched', data))
    } catch (error) {
      next(error)
    }
  }
}

export const dashboardController = new DashboardController(dashboardService)