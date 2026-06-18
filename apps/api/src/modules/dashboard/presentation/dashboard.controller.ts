import type { NextFunction, Request, Response } from 'express'

import type {
  DashboardActivityIntensityQuery,
  DashboardRecentItemsQuery,
} from '../application/dtos/dashboard.dto'
import { dashboardService, type DashboardService } from '../dashboard.service'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this.service.getSummary(userId)

      return res.json(new ApiResponse('Dashboard fetched', data))
    } catch (error) {
      return next(error)
    }
  }

  getCurrentRoadmap = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this.service.getCurrentRoadmap(userId)

      return res.json(new ApiResponse('Current roadmap fetched', data))
    } catch (error) {
      return next(error)
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
      const data = await this.service.getActivityIntensity(userId, query.months)

      return res.json(new ApiResponse('Activity intensity fetched', data))
    } catch (error) {
      return next(error)
    }
  }

  getRecentBattles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const query = res.locals.dashboardRecentItemsQuery as DashboardRecentItemsQuery
      const data = await this.service.getRecentBattles(userId, query.limit)

      return res.json(new ApiResponse('Recent battles fetched', data))
    } catch (error) {
      return next(error)
    }
  }

  getFriendsHub = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const query = res.locals.dashboardRecentItemsQuery as DashboardRecentItemsQuery
      const data = await this.service.getFriendsHub(userId, query.limit)

      return res.json(new ApiResponse('Friends hub fetched', data))
    } catch (error) {
      return next(error)
    }
  }

  getRecommendedActions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this.service.getRecommendedActions(userId)

      return res.json(new ApiResponse('Recommended actions fetched', data))
    } catch (error) {
      return next(error)
    }
  }

  getAIInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this.service.getAIInsights(userId)

      return res.json(new ApiResponse('AI insights fetched', data))
    } catch (error) {
      return next(error)
    }
  }
}

export const dashboardController = new DashboardController(dashboardService)
