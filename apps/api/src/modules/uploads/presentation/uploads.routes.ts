import { Router } from 'express'

import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validateUploadedImageSignature } from '../../../shared/middlewares/image-upload-signature.middleware'
import {
  avatarUpload,
  bannerUpload,
} from '../../../shared/middlewares/profile-image-upload'
import {
  authenticatedApiIpLimiter,
  profileImageUploadIpLimiter,
} from '../../../shared/middlewares/security-rate-limit.middleware'
import { validate } from '../../../shared/middlewares/validate'
import { uploadsController } from './uploads.controller'
import {
  generateAiAvatarPreviewSchema,
  generateAiBannerPreviewSchema,
} from './uploads.schema'

const router = Router()

// ─── PROTECTED ───────────────────────────────────────────────

router.use(authenticatedApiIpLimiter, authenticate)

router.post(
  '/avatar',
  profileImageUploadIpLimiter,
  avatarUpload.single('file'),
  validateUploadedImageSignature,
  uploadsController.uploadAvatar,
)

router.delete('/avatar', uploadsController.removeAvatar)

router.post(
  '/avatar/ai-preview',
  validate(generateAiAvatarPreviewSchema),
  uploadsController.generateAiAvatarPreview,
)

router.post(
  '/banner',
  profileImageUploadIpLimiter,
  bannerUpload.single('file'),
  validateUploadedImageSignature,
  uploadsController.uploadBanner,
)

router.delete('/banner', uploadsController.removeBanner)

router.post(
  '/banner/ai-preview',
  validate(generateAiBannerPreviewSchema),
  uploadsController.generateAiBannerPreview,
)

export default router
export { router as uploadsRoutes }
