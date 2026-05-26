import { Request, Response, NextFunction } from 'express'
import { settingsService } from '../settings.service'
import { ApiResponse } from '../../../shared/utils/ApiResponse'

export const settingsController = {
  getAllSettings: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.getAllSettings(req.user!.userId)
      res.json(new ApiResponse('Settings fetched', data))
    } catch (error) {
      next(error)
    }
  },

  getAppearanceSettings: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.getAppearanceSettings(req.user!.userId)
      res.json(new ApiResponse('Appearance settings fetched', data))
    } catch (error) {
      next(error)
    }
  },

  getNotificationSettings: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.getNotificationSettings(req.user!.userId)
      res.json(new ApiResponse('Notification settings fetched', data))
    } catch (error) {
      next(error)
    }
  },

  getPrivacySettings: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.getPrivacySettings(req.user!.userId)
      res.json(new ApiResponse('Privacy settings fetched', data))
    } catch (error) {
      next(error)
    }
  },

  getGestureSettings: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.getGestureSettings(req.user!.userId)
      res.json(new ApiResponse('Gesture settings fetched', data))
    } catch (error) {
      next(error)
    }
  },

  updateAccountSettings: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateAccountSettings(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Account settings updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateAppearance: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateAppearance(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Appearance updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateNotifications: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateNotifications(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Notifications updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateQuietHours: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateQuietHours(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Quiet hours updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateEmailDigest: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateEmailDigest(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Email digest updated', data))
    } catch (error) {
      next(error)
    }
  },

  updatePrivacy: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updatePrivacy(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Privacy settings updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateCodeEditor: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateCodeEditor(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Code editor settings updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateCompiler: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateCompiler(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Compiler settings updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateAIBehaviour: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateAIBehaviour(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('AI behaviour updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateLearningJourney: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateLearningJourney(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Learning journey updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateGestures: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.updateGestures(
        req.user!.userId,
        req.body
      )
      res.json(new ApiResponse('Gesture settings updated', data))
    } catch (error) {
      next(error)
    }
  },

  updateCookieConsent: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { cookieConsent } = req.body

      const data = await settingsService.updateCookieConsent(
        req.user!.userId,
        cookieConsent
      )

      res.json(new ApiResponse('Cookie consent updated', data))
    } catch (error) {
      next(error)
    }
  },

  acceptTerms: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.acceptTerms(req.user!.userId)
      res.json(new ApiResponse('Terms accepted', data))
    } catch (error) {
      next(error)
    }
  },

  resetToDefaults: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await settingsService.resetToDefaults(req.user!.userId)
      res.json(new ApiResponse('Settings reset to defaults', data))
    } catch (error) {
      next(error)
    }
  },
}
