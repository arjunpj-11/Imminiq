import { Router } from 'express'
import { settingsController } from './settings.controller'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { authenticatedApiIpLimiter } from '../../../shared/middlewares/security-rate-limit.middleware'
import {
  updateAccountSettingsSchema,
  updateAppearanceSchema,
  updateNotificationsSchema,
  updatePrivacySchema,
  updateCodeEditorSchema,
  updateCompilerSchema,
  updateAIBehaviourSchema,
  updateLearningJourneySchema,
  updateGesturesSchema,
  updateQuietHoursSchema,
  updateEmailDigestSchema,
  updateCookieConsentSchema,
} from '../settings.schema'

const router = Router()

router.use(
  authenticatedApiIpLimiter,
  authenticate
)

// GET ALL
router.get('/', settingsController.getAllSettings)

// ACCOUNT LOCALIZATION
router.patch(
  '/account',
  validate(updateAccountSettingsSchema),
  settingsController.updateAccountSettings
)

// APPEARANCE
router.get('/appearance', settingsController.getAppearanceSettings)
router.patch(
  '/appearance',
  validate(updateAppearanceSchema),
  settingsController.updateAppearance
)

// NOTIFICATIONS
router.get('/notifications', settingsController.getNotificationSettings)
router.patch(
  '/notifications',
  validate(updateNotificationsSchema),
  settingsController.updateNotifications
)

router.patch(
  '/notifications/quiet-hours',
  validate(updateQuietHoursSchema),
  settingsController.updateQuietHours
)

router.patch(
  '/notifications/email-digest',
  validate(updateEmailDigestSchema),
  settingsController.updateEmailDigest
)

// PRIVACY
router.get('/privacy', settingsController.getPrivacySettings)
router.patch(
  '/privacy',
  validate(updatePrivacySchema),
  settingsController.updatePrivacy
)

// CODE EDITOR
router.patch(
  '/code-editor',
  validate(updateCodeEditorSchema),
  settingsController.updateCodeEditor
)

// COMPILER
router.patch(
  '/compiler',
  validate(updateCompilerSchema),
  settingsController.updateCompiler
)

// AI BEHAVIOUR
router.patch(
  '/ai-behavior',
  validate(updateAIBehaviourSchema),
  settingsController.updateAIBehaviour
)

// LEARNING JOURNEY
router.patch(
  '/learning-journey',
  validate(updateLearningJourneySchema),
  settingsController.updateLearningJourney
)

// GESTURES
router.get('/gestures', settingsController.getGestureSettings)
router.patch(
  '/gestures',
  validate(updateGesturesSchema),
  settingsController.updateGestures
)

// LEGAL / CONSENT
router.patch(
  '/preferences',
  validate(updateCookieConsentSchema),
  settingsController.updateCookieConsent
)

router.post('/accept-terms', settingsController.acceptTerms)

// RESET
router.post('/reset', settingsController.resetToDefaults)

export default router
