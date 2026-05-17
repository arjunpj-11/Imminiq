import type { Request, Response, NextFunction } from 'express'

import { ApiResponse } from '../../shared/utils/ApiResponse'
import { moderationAppealService } from './moderation-appeal.service'

export const moderationAppealController = {
  submitAppeal: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await moderationAppealService.submitAppeal(req.body)

      res.status(201).json(
        new ApiResponse(
          'Appeal submitted successfully. Our team will review it shortly.',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },
  getAppealStatus: async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await moderationAppealService.getActiveAppealStatus(req.body)

    res.json(
      new ApiResponse('Active appeal fetched', result)
    )
  } catch (error) {
    next(error)
  }
},
}