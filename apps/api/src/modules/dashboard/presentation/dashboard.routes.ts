import { Router } from 'express'
import { dashboardController } from './dashboard.controller'
import { authenticate } from '../../../shared/middlewares/auth.middleware'

const router = Router()

router.use(authenticate)

router.get(
  '/summary',
  dashboardController.getSummary
)

router.get(
  '/current-roadmap',
  dashboardController.getCurrentRoadmap
)

router.get(
  '/activity-intensity',
  dashboardController.getActivityIntensity
)

router.get(
  '/recent-battles',
  dashboardController.getRecentBattles
)

router.get(
  '/friends-hub',
  dashboardController.getFriendsHub
)

router.get(
  '/recommended-actions',
  dashboardController.getRecommendedActions
)

router.get(
  '/ai-insights',
  dashboardController.getAIInsights
)

export default router
