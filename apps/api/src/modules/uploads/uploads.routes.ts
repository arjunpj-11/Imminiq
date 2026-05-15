import { Router } from 'express'
import {
  avatarUpload,
  bannerUpload,
} from '../../shared/middlewares/profile-image-upload'
import { uploadsController } from './uploads.controller'
import { authenticate } from '../../shared/middlewares/auth.middleware'
import { validate } from '../../shared/middlewares/validate'
import {
  generateAiAvatarPreviewSchema,
  generateAiBannerPreviewSchema,
} from './uploads.schema'

const router = Router()

router.use(authenticate)

router.post(
  '/avatar',
  avatarUpload.single('file'),
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
  bannerUpload.single('file'),
  uploadsController.uploadBanner
)

router.delete('/banner', uploadsController.removeBanner)

router.post(
  '/banner/ai-preview',
  validate(generateAiBannerPreviewSchema),
  uploadsController.generateAiBannerPreview
)

export default router