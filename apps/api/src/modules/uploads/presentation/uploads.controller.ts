import type { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { uploadsService } from '../application/services/uploads.service'

const requireUserId = (req: Request) => {
  const userId = req.user?.userId

  if (!userId) {
    throw new Error('Authenticated user id is missing')
  }

  return userId
}

export const uploadsController = {
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await uploadsService.uploadProfileImage({
        userId: requireUserId(req),
        kind: 'avatar',
        file: req.file as Express.Multer.File,
      })

      res
        .status(200)
        .json(
          new ApiResponse(
            'Avatar uploaded successfully',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async removeAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await uploadsService.removeAvatar(requireUserId(req))

      res
        .status(200)
        .json(
          new ApiResponse(
            'Avatar removed',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async uploadBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await uploadsService.uploadProfileImage({
        userId: requireUserId(req),
        kind: 'banner',
        file: req.file as Express.Multer.File,
      })

      res
        .status(200)
        .json(
          new ApiResponse(
            'Banner uploaded successfully',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async removeBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await uploadsService.removeBanner(requireUserId(req))

      res
        .status(200)
        .json(
          new ApiResponse(
            'Banner removed',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async generateAiAvatarPreview(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { prompt } = req.body

      const result = await uploadsService.generateAiAvatarPreview(prompt)

      res
        .status(200)
        .json(
          new ApiResponse(
            'AI avatar preview generated successfully',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async generateAiBannerPreview(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { prompt } = req.body

      const result = await uploadsService.generateAiBannerPreview(prompt)

      res
        .status(200)
        .json(
          new ApiResponse(
            'AI banner preview generated successfully',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },
}
