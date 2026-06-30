import type { NextFunction, Request, Response } from 'express'

import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import { settingsService, type SettingsService } from '../settings.service'

export class SettingsController {
  constructor(private readonly _service: SettingsService) {}

  getAllSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._service.getAllSettings(getAuthUser(req).userId)

      res.json(new ApiResponse('Settings fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getAppearanceSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.getAppearanceSettings(
        getAuthUser(req).userId
      )

      res.json(new ApiResponse('Appearance settings fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getNotificationSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.getNotificationSettings(
        getAuthUser(req).userId
      )

      res.json(new ApiResponse('Notification settings fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getPrivacySettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.getPrivacySettings(
        getAuthUser(req).userId
      )

      res.json(new ApiResponse('Privacy settings fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getGestureSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.getGestureSettings(
        getAuthUser(req).userId
      )

      res.json(new ApiResponse('Gesture settings fetched', data))
    } catch (error) {
      next(error)
    }
  }

  updateAccountSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.updateAccountSettings(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Account settings updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateAppearance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.updateAppearance(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Appearance updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.updateNotifications(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Notifications updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateQuietHours = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.updateQuietHours(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Quiet hours updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateEmailDigest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.updateEmailDigest(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Email digest updated', data))
    } catch (error) {
      next(error)
    }
  }

  updatePrivacy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._service.updatePrivacy(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Privacy settings updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateCodeEditor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.updateCodeEditor(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Code editor settings updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateCompiler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._service.updateCompiler(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Compiler settings updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateAIBehaviour = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.updateAIBehaviour(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('AI behaviour updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateLearningJourney = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.updateLearningJourney(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Learning journey updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateGestures = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.updateGestures(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Gesture settings updated', data))
    } catch (error) {
      next(error)
    }
  }

  updateCookieConsent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { cookieConsent } = req.body
      const data = await this._service.updateCookieConsent(
        getAuthUser(req).userId,
        cookieConsent
      )

      res.json(new ApiResponse('Cookie consent updated', data))
    } catch (error) {
      next(error)
    }
  }

  acceptTerms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._service.acceptTerms(getAuthUser(req).userId)

      res.json(new ApiResponse('Terms accepted', data))
    } catch (error) {
      next(error)
    }
  }

  resetToDefaults = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this._service.resetToDefaults(getAuthUser(req).userId)

      res.json(new ApiResponse('Settings reset to defaults', data))
    } catch (error) {
      next(error)
    }
  }
}

export const settingsController = new SettingsController(settingsService)