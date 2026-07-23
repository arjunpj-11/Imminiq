import { Router } from 'express';

import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { validateUploadedImageSignature } from '../../../shared/middlewares/image-upload-signature.middleware';
import {
  avatarUpload,
  bannerUpload,
} from '../../../shared/middlewares/profile-image-upload.middleware';
import {
  authenticatedApiIpLimiter,
  profileImageUploadIpLimiter,
} from '../../../shared/middlewares/security-rate-limit.middleware';
import { validate } from '../../../shared/middlewares/validate.middleware';
import { UploadsController } from './uploads.controller';
import type { UploadsUseCases } from '../application/uploads-use-cases.contract';
import { UPLOAD_ROUTE_PATHS } from './uploads.route.constants';
import { generateAIAvatarPreviewSchema, generateAIBannerPreviewSchema } from './uploads.schema';

export const createUploadsRoutes = (useCases: UploadsUseCases) => {
  const uploadsController = new UploadsController(useCases);
  const router = Router();

  // ─── PROTECTED ───────────────────────────────────────────────

  router.use(authenticatedApiIpLimiter, authenticate);

  router.post(
    UPLOAD_ROUTE_PATHS.AVATAR,
    profileImageUploadIpLimiter,
    avatarUpload.single('file'),
    validateUploadedImageSignature,
    uploadsController.uploadAvatar
  );

  router.delete(UPLOAD_ROUTE_PATHS.AVATAR, uploadsController.removeAvatar);

  router.post(
    UPLOAD_ROUTE_PATHS.AVATAR_AI_PREVIEW,
    validate(generateAIAvatarPreviewSchema),
    uploadsController.generateAIAvatarPreview
  );

  router.post(
    UPLOAD_ROUTE_PATHS.BANNER,
    profileImageUploadIpLimiter,
    bannerUpload.single('file'),
    validateUploadedImageSignature,
    uploadsController.uploadBanner
  );

  router.delete(UPLOAD_ROUTE_PATHS.BANNER, uploadsController.removeBanner);

  router.post(
    UPLOAD_ROUTE_PATHS.BANNER_AI_PREVIEW,
    validate(generateAIBannerPreviewSchema),
    uploadsController.generateAIBannerPreview
  );

  return router;
};
