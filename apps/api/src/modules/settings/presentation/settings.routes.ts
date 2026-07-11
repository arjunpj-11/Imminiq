import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { SettingsController } from './settings.controller'
import { createSettingsComposition } from '../settings.factory'
import { SETTINGS_ROUTE_PATHS } from './settings.route.constants'
import {
  updateAccountSettingsSchema,
  updateAIBehaviourSchema,
  updateAppearanceSchema,
  updateCodeEditorSchema,
  updateCompilerSchema,
  updateCookieConsentSchema,
  updateEmailDigestSchema,
  updateGesturesSchema,
  updateLearningJourneySchema,
  updateNotificationsSchema,
  updatePrivacySchema,
  updateQuietHoursSchema,
} from './settings.schema'

const settingsController = new SettingsController(createSettingsComposition().useCases)
const router = Router()

router.use(authenticatedApiIpLimiter, authenticate)

// ─── READ SETTINGS ───────────────────────────────────────────

router.get(
  SETTINGS_ROUTE_PATHS.ROOT,
  settingsController.getAllSettings
)

router.get(
  SETTINGS_ROUTE_PATHS.APPEARANCE,
  settingsController.getAppearanceSettings
)

router.get(
  SETTINGS_ROUTE_PATHS.NOTIFICATIONS,
  settingsController.getNotificationSettings
)

router.get(
  SETTINGS_ROUTE_PATHS.PRIVACY,
  settingsController.getPrivacySettings
)

router.get(
  SETTINGS_ROUTE_PATHS.GESTURES,
  settingsController.getGestureSettings
)

// ─── UPDATE SETTINGS ─────────────────────────────────────────

router.patch(
  SETTINGS_ROUTE_PATHS.ACCOUNT,
  validate(updateAccountSettingsSchema),
  settingsController.updateAccountSettings
)

router.patch(
  SETTINGS_ROUTE_PATHS.APPEARANCE,
  validate(updateAppearanceSchema),
  settingsController.updateAppearance
)

router.patch(
  SETTINGS_ROUTE_PATHS.NOTIFICATIONS,
  validate(updateNotificationsSchema),
  settingsController.updateNotifications
)

router.patch(
  SETTINGS_ROUTE_PATHS.NOTIFICATION_QUIET_HOURS,
  validate(updateQuietHoursSchema),
  settingsController.updateQuietHours
)

router.patch(
  SETTINGS_ROUTE_PATHS.NOTIFICATION_EMAIL_DIGEST,
  validate(updateEmailDigestSchema),
  settingsController.updateEmailDigest
)

router.patch(
  SETTINGS_ROUTE_PATHS.PRIVACY,
  validate(updatePrivacySchema),
  settingsController.updatePrivacy
)

router.patch(
  SETTINGS_ROUTE_PATHS.CODE_EDITOR,
  validate(updateCodeEditorSchema),
  settingsController.updateCodeEditor
)

router.patch(
  SETTINGS_ROUTE_PATHS.COMPILER,
  validate(updateCompilerSchema),
  settingsController.updateCompiler
)

router.patch(
  SETTINGS_ROUTE_PATHS.AI_BEHAVIOR,
  validate(updateAIBehaviourSchema),
  settingsController.updateAIBehaviour
)

router.patch(
  SETTINGS_ROUTE_PATHS.LEARNING_JOURNEY,
  validate(updateLearningJourneySchema),
  settingsController.updateLearningJourney
)

router.patch(
  SETTINGS_ROUTE_PATHS.GESTURES,
  validate(updateGesturesSchema),
  settingsController.updateGestures
)

router.patch(
  SETTINGS_ROUTE_PATHS.PREFERENCES,
  validate(updateCookieConsentSchema),
  settingsController.updateCookieConsent
)

// ─── ACCOUNT AGREEMENTS / RESET ──────────────────────────────

router.post(
  SETTINGS_ROUTE_PATHS.ACCEPT_TERMS,
  settingsController.acceptTerms
)

router.post(
  SETTINGS_ROUTE_PATHS.RESET,
  settingsController.resetToDefaults
)

export default router
export { router as settingsRoutes }