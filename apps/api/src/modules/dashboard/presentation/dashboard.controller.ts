import {
  Request,
  Response,
  NextFunction,
} from 'express'

import { dashboardService } from '../dashboard.service'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { ApiError } from '../../../shared/utils/ApiError'
import {
  dashboardActivityIntensityQuerySchema,
  dashboardRecentItemsQuerySchema,
} from './dashboard.schema'

const getAuthenticatedUserId = (req: Request) => {
  const userId = req.user?.userId

  if (!userId) {
    throw new ApiError(
      401,
      'Unauthorized',
      'UNAUTHORIZED'
    )
  }

  return userId
}

export const dashboardController = {
  getSummary: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)

      const data =
        await dashboardService.getSummary(userId)

      res.json(
        new ApiResponse(
          'Dashboard fetched',
          data
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getCurrentRoadmap: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)

      const data =
        await dashboardService.getCurrentRoadmap(
          userId
        )

      res.json(
        new ApiResponse(
          'Current roadmap fetched',
          data
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getActivityIntensity: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)

      const query =
        dashboardActivityIntensityQuerySchema.parse(req.query)

      const data =
        await dashboardService.getActivityIntensity(
          userId,
          query.months
        )

      res.json(
        new ApiResponse(
          'Activity intensity fetched',
          data
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getRecentBattles: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)

      const query =
        dashboardRecentItemsQuerySchema.parse(req.query)

      const data =
        await dashboardService.getRecentBattles(
          userId,
          query.limit
        )

      res.json(
        new ApiResponse(
          'Recent battles fetched',
          data
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getFriendsHub: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)

      const query =
        dashboardRecentItemsQuerySchema.parse(req.query)

      const data =
        await dashboardService.getFriendsHub(
          userId,
          query.limit
        )

      res.json(
        new ApiResponse(
          'Friends hub fetched',
          data
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getRecommendedActions: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)

      const data =
        await dashboardService.getRecommendedActions(
          userId
        )

      res.json(
        new ApiResponse(
          'Recommended actions fetched',
          data
        )
      )
    } catch (error) {
      next(error)
    }
  },

  getAIInsights: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthenticatedUserId(req)

      const data =
        await dashboardService.getAIInsights(userId)

      res.json(
        new ApiResponse(
          'AI insights fetched',
          data
        )
      )
    } catch (error) {
      next(error)
    }
  },
}
