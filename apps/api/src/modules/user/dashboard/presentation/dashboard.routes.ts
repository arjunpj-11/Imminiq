import { Router, type RequestHandler } from 'express'

import { authenticate } from '../../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware'
import { DashboardController } from './dashboard.controller'
import { createDashboardComposition } from '../dashboard.factory'
import { DASHBOARD_ROUTE_PATHS } from './dashboard.route.constants'
import {
  dashboardActivityIntensityQuerySchema,
  dashboardRecentItemsQuerySchema,
} from './dashboard.schema'

const dashboardController = new DashboardController(createDashboardComposition().useCases)
const router = Router()

const validateActivityIntensityQuery: RequestHandler = (req, res, next) => {
  try {
    res.locals.dashboardActivityIntensityQuery =
      dashboardActivityIntensityQuerySchema.parse(req.query)

    return next()
  } catch (error) {
    return next(error)
  }
}

const validateRecentItemsQuery: RequestHandler = (req, res, next) => {
  try {
    res.locals.dashboardRecentItemsQuery =
      dashboardRecentItemsQuerySchema.parse(req.query)

    return next()
  } catch (error) {
    return next(error)
  }
}

// ─── PROTECTED ──────────────────────────────────────────────────────────────

router.use(authenticatedApiIpLimiter, authenticate)

router.get(
  DASHBOARD_ROUTE_PATHS.SUMMARY,
  dashboardController.getSummary
)

router.get(
  DASHBOARD_ROUTE_PATHS.CURRENT_ROADMAP,
  dashboardController.getCurrentRoadmap
)

router.get(
  DASHBOARD_ROUTE_PATHS.ACTIVITY_INTENSITY,
  validateActivityIntensityQuery,
  dashboardController.getActivityIntensity
)

router.get(
  DASHBOARD_ROUTE_PATHS.RECENT_BATTLES,
  validateRecentItemsQuery,
  dashboardController.getRecentBattles
)

router.get(
  DASHBOARD_ROUTE_PATHS.FRIENDS_HUB,
  validateRecentItemsQuery,
  dashboardController.getFriendsHub
)

router.get(
  DASHBOARD_ROUTE_PATHS.RECOMMENDED_ACTIONS,
  dashboardController.getRecommendedActions
)

router.get(
  DASHBOARD_ROUTE_PATHS.AI_INSIGHTS,
  dashboardController.getAIInsights
)

export default router
export { router as dashboardRoutes }