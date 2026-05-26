import { Router } from 'express'

import { usersController } from './users.controller'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { updateMyProfileSchema } from './users.schema'

const router = Router()

// ─── PUBLIC ROUTES ────────────────────────────────

// Guests and logged-in users can view public profiles
router.get(
  '/:username/public-profile',
  usersController.getPublicProfile
)

// ─── PROTECTED ROUTES ─────────────────────────────

router.use(authenticate)

router.get('/me', usersController.getMe)

router.patch(
  '/me',
  validate(updateMyProfileSchema),
  usersController.updateMe
)

router.get('/me/stats', usersController.getMyStats)

router.get('/me/activity', usersController.getMyActivity)

router.get(
  '/me/recent-activity',
  usersController.getMyRecentActivity
)

router.get('/me/streak', usersController.getMyStreak)

router.get(
  '/me/published-trackers',
  usersController.getMyPublishedTrackers
)

router.get('/me/badges', usersController.getMyBadges)

export default router
