import { Readable } from 'node:stream'
import { ApiError } from '../../shared/utils/ApiError'
import { cloudinary } from '../../infrastructure/storage/cloudinary.client'
import { usersRepository } from '../users/users.repository'
import { uploadsRepository } from './uploads.repository'
import { generateImageWithCloudflare } from '../../infrastructure/ai/cloudflare-image.client'

import type {
  StoredProfileImage,
  UploadProfileImageInput,
} from './uploads.types'

const uploadBufferToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<StoredProfileImage> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(new ApiError(500, 'Image upload failed'))
          return
        }

        resolve({
          fileUrl: result.secure_url,
          fileName: file.originalname,
          fileType: file.mimetype.split('/')[1] ?? 'image',
          mimeType: file.mimetype,
          sizeBytes: file.size,
          storagePublicId: result.public_id,
        })
      }
    )

    Readable.from(file.buffer).pipe(stream)
  })
}

export const uploadsService = {
  async uploadProfileImage({
    userId,
    kind,
    file,
  }: UploadProfileImageInput) {
    if (!file) {
      throw new ApiError(400, 'Image file is required')
    }

    const user = await usersRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const profile = await usersRepository.ensureProfileForUser(
      user._id,
      user.fullName ?? ''
    )

    const folder =
      kind === 'avatar' ? 'imminiq/avatars' : 'imminiq/banners'

    const stored = await uploadBufferToCloudinary(file, folder)

    if (kind === 'avatar') {
      await uploadsRepository.setAvatarUrl(userId, stored.fileUrl)
    } else {
      await uploadsRepository.setBannerUrl(userId, stored.fileUrl)
    }

    const upload = await uploadsRepository.saveUploadRecord(
      userId,
      kind,
      stored,
      String(profile._id)
    )

    return {
      uploadId: String(upload._id),
      fileUrl: stored.fileUrl,
      kind,
    }
  },

  async removeAvatar(userId: string) {
    const user = await usersRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    await Promise.all([
      uploadsRepository.clearAvatarUrl(userId),
      uploadsRepository.softDeleteLatestProfileUpload(userId, 'avatar'),
    ])

    return {
      avatarRemoved: true,
      defaultAvatarApplied: true,
    }
  },

  async removeBanner(userId: string) {
    const user = await usersRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    await Promise.all([
      uploadsRepository.clearBannerUrl(userId),
      uploadsRepository.softDeleteLatestProfileUpload(userId, 'banner'),
    ])

    return {
      bannerRemoved: true,
    }
  },

  async generateAiAvatarPreview(prompt: string) {
    const cleanedPrompt = prompt.trim()

    if (!cleanedPrompt) {
      throw new ApiError(400, 'Prompt is required')
    }

    const avatarOptimizedPrompt = `
Create a clean, high-quality profile avatar.
Subject instructions: ${cleanedPrompt}.
Style: centered portrait, clear face or character focus, polished digital illustration,
professional profile picture composition, balanced lighting, simple background,
no text, no watermark, no logo, square-friendly framing.
`.trim()

    const image = await generateImageWithCloudflare({
      prompt: avatarOptimizedPrompt,
      steps: 4,
      seed: Math.floor(Math.random() * 1_000_000),
    })

    return {
      imageUrl: image.dataUrl,
    }
  },

  async generateAiBannerPreview(prompt: string) {
    const cleanedPrompt = prompt.trim()

    if (!cleanedPrompt) {
      throw new ApiError(400, 'Prompt is required')
    }

    const bannerOptimizedPrompt = `
Create a premium, high-quality profile banner background.
Subject instructions: ${cleanedPrompt}.
Composition: cinematic wide-profile cover style, visually rich but not cluttered,
important visual elements placed near the center so the image can be cropped into a horizontal banner,
balanced spacing on the left and right side.
Style: polished digital artwork, elegant lighting, detailed background, premium visual quality,
no text, no letters, no watermark, no logo, no UI elements.
`.trim()

    const image = await generateImageWithCloudflare({
      prompt: bannerOptimizedPrompt,
      steps: 4,
      seed: Math.floor(Math.random() * 1_000_000),
    })

    return {
      imageUrl: image.dataUrl,
    }
  },
}