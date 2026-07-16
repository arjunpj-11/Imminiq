import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiIpLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import { validate } from '../../../../shared/middlewares/validate';
import { SettingsController } from './settings.controller';
import type { SettingsUseCases } from '../application/settings-use-cases.contract';
import { SETTINGS_ROUTE_PATHS } from './settings.route.constants';
import {
  updateAppearanceSchema,
  updateNotificationsSchema,
  updatePrivacySchema,
  submitDataPrivacyRequestSchema,
} from './settings.schema';

export const createSettingsRoutes = (useCases: SettingsUseCases) => {
  const settingsController = new SettingsController(useCases);
  const router = Router();

  router.use(authenticatedApiIpLimiter, authenticate);

  // ─── READ SETTINGS ───────────────────────────────────────────

  router.get(SETTINGS_ROUTE_PATHS.ROOT, settingsController.getAllSettings);

  router.get(SETTINGS_ROUTE_PATHS.APPEARANCE, settingsController.getAppearanceSettings);

  router.get(SETTINGS_ROUTE_PATHS.NOTIFICATIONS, settingsController.getNotificationSettings);

  router.get(SETTINGS_ROUTE_PATHS.PRIVACY, settingsController.getPrivacySettings);

  // ─── UPDATE SETTINGS ─────────────────────────────────────────

  router.get(SETTINGS_ROUTE_PATHS.PRIVACY_REQUESTS, settingsController.listPrivacyRequests);
  router.post(
    SETTINGS_ROUTE_PATHS.PRIVACY_REQUESTS,
    validate(submitDataPrivacyRequestSchema),
    settingsController.submitPrivacyRequest
  );
  router.delete(
    SETTINGS_ROUTE_PATHS.PRIVACY_REQUEST_DETAIL,
    settingsController.cancelPrivacyRequest
  );

  router.patch(
    SETTINGS_ROUTE_PATHS.APPEARANCE,
    validate(updateAppearanceSchema),
    settingsController.updateAppearance
  );

  router.patch(
    SETTINGS_ROUTE_PATHS.NOTIFICATIONS,
    validate(updateNotificationsSchema),
    settingsController.updateNotifications
  );

  router.patch(
    SETTINGS_ROUTE_PATHS.PRIVACY,
    validate(updatePrivacySchema),
    settingsController.updatePrivacy
  );

  // ─── ACCOUNT AGREEMENTS / RESET ──────────────────────────────

  router.post(SETTINGS_ROUTE_PATHS.RESET, settingsController.resetToDefaults);

  return router;
};
