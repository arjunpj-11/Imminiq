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
} from './settings.schema'

const router = Router()

router.use(
  authenticatedApiIpLimiter,
  authenticate
)

router.get('/', settingsController.getAllSettings)

router.patch(
  '/account',
  validate(updateAccountSettingsSchema),
  settingsController.updateAccountSettings
)

router.get('/appearance', settingsController.getAppearanceSettings)
router.patch(
  '/appearance',
  validate(updateAppearanceSchema),
  settingsController.updateAppearance
)

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

router.get('/privacy', settingsController.getPrivacySettings)
router.patch(
  '/privacy',
  validate(updatePrivacySchema),
  settingsController.updatePrivacy
)

router.patch(
  '/code-editor',
  validate(updateCodeEditorSchema),
  settingsController.updateCodeEditor
)

router.patch(
  '/compiler',
  validate(updateCompilerSchema),
  settingsController.updateCompiler
)

router.patch(
  '/ai-behavior',
  validate(updateAIBehaviourSchema),
  settingsController.updateAIBehaviour
)

router.patch(
  '/learning-journey',
  validate(updateLearningJourneySchema),
  settingsController.updateLearningJourney
)

router.get('/gestures', settingsController.getGestureSettings)
router.patch(
  '/gestures',
  validate(updateGesturesSchema),
  settingsController.updateGestures
)

router.patch(
  '/preferences',
  validate(updateCookieConsentSchema),
  settingsController.updateCookieConsent
)

router.post('/accept-terms', settingsController.acceptTerms)

router.post('/reset', settingsController.resetToDefaults)

export default router
