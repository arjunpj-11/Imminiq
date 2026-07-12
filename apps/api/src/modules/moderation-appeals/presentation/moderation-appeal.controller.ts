import type { NextFunction, Request, Response } from 'express'

import { HttpStatusCode } from '../../../shared/constants/http-status-code.enum'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import type { ModerationAppealUseCases } from '../application/contracts/moderation-appeal-use-cases.contract'

export class ModerationAppealController {
  constructor(private readonly _useCases: ModerationAppealUseCases) {}

  submitAppeal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authorization = res.locals.appealAuthorization as { userId: string; identifier: string }
      const payload = { ...req.body, ...authorization }
      const result = await this._useCases.submitModerationAppeal.execute(payload)

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
      const authorization = res.locals.appealAuthorization as { userId: string; identifier: string }
      const payload = { ...req.body, ...authorization }
      const result = await this._useCases.getActiveModerationAppealStatus.execute(payload)

      res.json(new ApiResponse('Active appeal fetched', result))
    } catch (error) {
      next(error)
    }
  }
}
