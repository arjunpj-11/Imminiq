import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import { HttpStatusCode } from '../../../shared/constants/http-status-code.enum'
import { ApiError } from '../../../shared/utils/ApiError'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import {
  activityService,
  type ActivityService,
} from '../activity.service'
import {
  activityFeedQuerySchema,
  activityPageQuerySchema,
} from './activity.schema'

export class ActivityController {
  constructor(
    private readonly _service: ActivityService,
  ) {}

  getPage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const parsedQuery =
        activityPageQuerySchema.safeParse(req.query)

      if (!parsedQuery.success) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          parsedQuery.error.issues[0]?.message ??
            'Activity query is invalid',
          'VALIDATION_ERROR',
        )
      }

      const user = getAuthUser(req)

      const activity =
        await this._service.getActivityPage(
          user.userId,
          parsedQuery.data,
        )

      res.json(
        new ApiResponse(
          'Activity page fetched',
          activity,
        ),
      )
    } catch (error) {
      next(error)
    }
  }

  getFeed = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const parsedQuery =
        activityFeedQuerySchema.safeParse(req.query)

      if (!parsedQuery.success) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          parsedQuery.error.issues[0]?.message ??
            'Activity feed query is invalid',
          'VALIDATION_ERROR',
        )
      }

      const user = getAuthUser(req)

      const feed =
        await this._service.getActivityFeed(
          user.userId,
          parsedQuery.data,
        )

      res.json(
        new ApiResponse(
          'Activity feed fetched',
          feed,
        ),
      )
    } catch (error) {
      next(error)
    }
  }
}

export const activityController =
  new ActivityController(activityService)
