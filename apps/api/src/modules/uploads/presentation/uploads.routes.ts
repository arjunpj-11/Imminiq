import { Router } from 'express'
import {
  avatarUpload,
  bannerUpload,
} from '../../../shared/middlewares/profile-image-upload'
import { validateUploadedImageSignature } from '../../../shared/middlewares/image-upload-signature.middleware'
import {
  authenticatedApiIpLimiter,
  profileImageUploadIpLimiter,
} from '../../../shared/middlewares/security-rate-limit.middleware'
import { uploadsController } from './uploads.controller'
import { authenticate } from '../../../shared/middlewares/auth.middleware'
import { validate } from '../../../shared/middlewares/validate'
import {
  generateAiAvatarPreviewSchema,
  generateAiBannerPreviewSchema,
} from '../uploads.schema'

const router = Router()

router.use(
  authenticatedApiIpLimiter,
  authenticate
)

router.post(
  '/avatar',
  profileImageUploadIpLimiter,
  avatarUpload.single('file'),
  validateUploadedImageSignature,
  uploadsController.uploadAvatar
)

router.delete('/avatar', uploadsController.removeAvatar)

router.post(
  '/avatar/ai-preview',
  validate(generateAiAvatarPreviewSchema),
  uploadsController.generateAiAvatarPreview
)

router.post(
  '/banner',
  profileImageUploadIpLimiter,
  bannerUpload.single('file'),
  validateUploadedImageSignature,
  uploadsController.uploadBanner
)

router.delete('/banner', uploadsController.removeBanner)

router.post(
  '/banner/ai-preview',
  validate(generateAiBannerPreviewSchema),
  uploadsController.generateAiBannerPreview
)

export default router
