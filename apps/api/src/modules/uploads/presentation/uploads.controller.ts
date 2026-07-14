import type { NextFunction, Request, Response } from 'express';

import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../shared/utils/getAuthUser';
import type { GenerateAIImagePreviewInputDTO } from '../application/uploads.dto';
import type { UploadedProfileImageFile } from '../domain/uploads.types';
import type { UploadsUseCases } from '../application/uploads-use-cases.contract';

export class UploadsController {
  constructor(private readonly _useCases: UploadsUseCases) {}

  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const file = this.getUploadedFile(req);

      const result = await this._useCases.uploadProfileImage.execute({
        userId,
        kind: 'avatar',
        ...(file ? { file } : {}),
      });

      res.json(new ApiResponse('Avatar uploaded successfully', result));
    } catch (error) {
      next(error);
    }
  };

  removeAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const result = await this._useCases.removeAvatar.execute(userId);

      res.json(new ApiResponse('Avatar removed', result));
    } catch (error) {
      next(error);
    }
  };

  uploadBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const file = this.getUploadedFile(req);

      const result = await this._useCases.uploadProfileImage.execute({
        userId,
        kind: 'banner',
        ...(file ? { file } : {}),
      });

      res.json(new ApiResponse('Banner uploaded successfully', result));
    } catch (error) {
      next(error);
    }
  };

  removeBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const result = await this._useCases.removeBanner.execute(userId);

      res.json(new ApiResponse('Banner removed', result));
    } catch (error) {
      next(error);
    }
  };

  generateAIAvatarPreview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt } = req.body as GenerateAIImagePreviewInputDTO;
      const result = await this._useCases.generateAIAvatarPreview.execute(prompt);

      res.json(new ApiResponse('AI avatar preview generated successfully', result));
    } catch (error) {
      next(error);
    }
  };

  generateAIBannerPreview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt } = req.body as GenerateAIImagePreviewInputDTO;
      const result = await this._useCases.generateAIBannerPreview.execute(prompt);

      res.json(new ApiResponse('AI banner preview generated successfully', result));
    } catch (error) {
      next(error);
    }
  };

  private getUploadedFile(req: Request): UploadedProfileImageFile | undefined {
    if (!req.file) {
      return undefined;
    }

    return {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
    };
  }
}
