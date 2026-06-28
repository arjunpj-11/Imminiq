import type { NextFunction, Request, Response } from 'express'

import { HttpStatusCode } from '../../../shared/constants/http-status-code.enum'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import {
  moderationAppealService,
  type ModerationAppealService,
} from '../moderation-appeal.service'

export class ModerationAppealController {
  constructor(private readonly _service: ModerationAppealService) {}

  submitAppeal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = req.body
      const result = await this._service.submitAppeal(payload)

      res
        .status(HttpStatusCode.CREATED)
        .json(
          new ApiResponse(
            'Appeal submitted successfully. Our team will review it shortly.',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  }

  getAppealStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = req.body
      const result = await this._service.getActiveAppealStatus(payload)

      res.json(new ApiResponse('Active appeal fetched', result))
    } catch (error) {
      next(error)
    }
  }
}

export const moderationAppealController = new ModerationAppealController(
  moderationAppealService
)