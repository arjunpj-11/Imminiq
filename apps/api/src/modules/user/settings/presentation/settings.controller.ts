import type { NextFunction, Request, Response } from 'express';

import { ApiResponse } from '../../../../shared/utils/api-response';
import { getAuthUser } from '../../../../shared/utils/get-auth-user';
import type { SettingsUseCases } from '../application/settings-use-cases.contract';

export class SettingsController {
  constructor(private readonly _useCases: SettingsUseCases) {}

  listPrivacyRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.dataPrivacyRequests.list(getAuthUser(req).userId);
      res.json(new ApiResponse('Privacy requests fetched', data));
    } catch (error) { next(error); }
  };

  submitPrivacyRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.dataPrivacyRequests.submit(getAuthUser(req).userId, req.body);
      res.status(201).json(new ApiResponse('Privacy request submitted', data));
    } catch (error) { next(error); }
  };

  cancelPrivacyRequest = async (req: Request<{ requestId: string }>, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.dataPrivacyRequests.cancel(getAuthUser(req).userId, req.params.requestId);
      res.json(new ApiResponse('Privacy request cancelled', data));
    } catch (error) { next(error); }
  };

  getAllSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getAllSettings.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('Settings fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getAppearanceSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getAppearanceSettings.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('Appearance settings fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getNotificationSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getNotificationSettings.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('Notification settings fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getPrivacySettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getPrivacySettings.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('Privacy settings fetched', data));
    } catch (error) {
      next(error);
    }
  };

  updateAppearance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.updateAppearance.execute(getAuthUser(req).userId, req.body);

      res.json(new ApiResponse('Appearance updated', data));
    } catch (error) {
      next(error);
    }
  };

  updateNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.updateNotifications.execute(
        getAuthUser(req).userId,
        req.body
      );

      res.json(new ApiResponse('Notifications updated', data));
    } catch (error) {
      next(error);
    }
  };

  updatePrivacy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.updatePrivacy.execute(getAuthUser(req).userId, req.body);

      res.json(new ApiResponse('Privacy settings updated', data));
    } catch (error) {
      next(error);
    }
  };

  resetToDefaults = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.resetSettingsToDefaults.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('Settings reset to defaults', data));
    } catch (error) {
      next(error);
    }
  };
}
