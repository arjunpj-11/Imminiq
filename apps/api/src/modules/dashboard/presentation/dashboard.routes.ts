import { Router, type RequestHandler } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { dashboardController } from './dashboard.controller'
import {
  dashboardActivityIntensityQuerySchema,
  dashboardRecentItemsQuerySchema,
} from './dashboard.schema'

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
router.get('/summary', dashboardController.getSummary)
router.get('/current-roadmap', dashboardController.getCurrentRoadmap)
router.get(
  '/activity-intensity',
  validateActivityIntensityQuery,
  dashboardController.getActivityIntensity
)
router.get(
  '/recent-battles',
  validateRecentItemsQuery,
  dashboardController.getRecentBattles
)
router.get(
  '/friends-hub',
  validateRecentItemsQuery,
  dashboardController.getFriendsHub
)
router.get('/recommended-actions', dashboardController.getRecommendedActions)
router.get('/ai-insights', dashboardController.getAIInsights)

export default router
export { router as dashboardRoutes }
