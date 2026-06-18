import type { NextFunction, Request, Response } from 'express'

import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import type { GenerateAiImagePreviewInput } from '../application/dtos/uploads.dto'
import type { UploadedProfileImageFile } from '../domain/value-objects/uploaded-profile-image-file.vo'
import { uploadsService, type UploadsService } from '../uploads.service'

export class UploadsController {
  constructor(private readonly service: UploadsService) {}

  uploadAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const file = this.getUploadedFile(req)
      const result = await this.service.uploadProfileImage({
        userId,
        kind: 'avatar',
        ...(file ? { file } : {}),
      })

      res
        .status(200)
        .json(new ApiResponse('Avatar uploaded successfully', result))
    } catch (error) {
      next(error)
    }
  }

  removeAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const result = await this.service.removeAvatar(userId)

      res.status(200).json(new ApiResponse('Avatar removed', result))
    } catch (error) {
      next(error)
    }
  }

  uploadBanner = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const file = this.getUploadedFile(req)
      const result = await this.service.uploadProfileImage({
        userId,
        kind: 'banner',
        ...(file ? { file } : {}),
      })

      res
        .status(200)
        .json(new ApiResponse('Banner uploaded successfully', result))
    } catch (error) {
      next(error)
    }
  }

  removeBanner = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getAuthUser(req).userId
      const result = await this.service.removeBanner(userId)

      res.status(200).json(new ApiResponse('Banner removed', result))
    } catch (error) {
      next(error)
    }
  }

  generateAiAvatarPreview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { prompt } = req.body as GenerateAiImagePreviewInput
      const result = await this.service.generateAiAvatarPreview(prompt)

      res
        .status(200)
        .json(
          new ApiResponse(
            'AI avatar preview generated successfully',
            result,
          ),
        )
    } catch (error) {
      next(error)
    }
  }

  generateAiBannerPreview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { prompt } = req.body as GenerateAiImagePreviewInput
      const result = await this.service.generateAiBannerPreview(prompt)

      res
        .status(200)
        .json(
          new ApiResponse(
            'AI banner preview generated successfully',
            result,
          ),
        )
    } catch (error) {
      next(error)
    }
  }

  private getUploadedFile(req: Request): UploadedProfileImageFile | undefined {
    if (!req.file) {
      return undefined
    }

    return {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
    }
  }
}

export const uploadsController = new UploadsController(uploadsService)
