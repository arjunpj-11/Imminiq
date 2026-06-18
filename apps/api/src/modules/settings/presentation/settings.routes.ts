import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { settingsController } from './settings.controller'
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

const router = Router()

router.use(authenticatedApiIpLimiter, authenticate)

// ─── READ SETTINGS ───────────────────────────────────────────

router.get('/', settingsController.getAllSettings)
router.get('/appearance', settingsController.getAppearanceSettings)
router.get('/notifications', settingsController.getNotificationSettings)
router.get('/privacy', settingsController.getPrivacySettings)
router.get('/gestures', settingsController.getGestureSettings)

// ─── UPDATE SETTINGS ─────────────────────────────────────────

router.patch(
  '/account',
  validate(updateAccountSettingsSchema),
  settingsController.updateAccountSettings,
)

router.patch(
  '/appearance',
  validate(updateAppearanceSchema),
  settingsController.updateAppearance,
)

router.patch(
  '/notifications',
  validate(updateNotificationsSchema),
  settingsController.updateNotifications,
)

router.patch(
  '/notifications/quiet-hours',
  validate(updateQuietHoursSchema),
  settingsController.updateQuietHours,
)

router.patch(
  '/notifications/email-digest',
  validate(updateEmailDigestSchema),
  settingsController.updateEmailDigest,
)

router.patch(
  '/privacy',
  validate(updatePrivacySchema),
  settingsController.updatePrivacy,
)

router.patch(
  '/code-editor',
  validate(updateCodeEditorSchema),
  settingsController.updateCodeEditor,
)

router.patch(
  '/compiler',
  validate(updateCompilerSchema),
  settingsController.updateCompiler,
)

router.patch(
  '/ai-behavior',
  validate(updateAIBehaviourSchema),
  settingsController.updateAIBehaviour,
)

router.patch(
  '/learning-journey',
  validate(updateLearningJourneySchema),
  settingsController.updateLearningJourney,
)

router.patch(
  '/gestures',
  validate(updateGesturesSchema),
  settingsController.updateGestures,
)

router.patch(
  '/preferences',
  validate(updateCookieConsentSchema),
  settingsController.updateCookieConsent,
)

// ─── ACCOUNT AGREEMENTS / RESET ──────────────────────────────

router.post('/accept-terms', settingsController.acceptTerms)
router.post('/reset', settingsController.resetToDefaults)

export default router
export { router as settingsRoutes }
