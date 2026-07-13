import type { NextFunction, Request, Response } from 'express'

import type { IPaginationQueryDTO } from '../application/users.dto'
import {
  USERS_DEFAULT_LIMIT,
  USERS_MAX_LIMIT,
  USERS_MAX_PAGE,
  USERS_MAX_SEARCH_LENGTH,
  USERS_MIN_STREAK_YEAR,
} from '../domain/users.constants'
import type { ProfileSort } from '../domain/value-objects/profile-sort.vo'
import type { UsersUseCases } from '../application/users-use-cases.contract'
import { ApiResponse } from '../../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../../shared/utils/getAuthUser'

type UsernameParams = {
  username: string
}

export class UsersController {
  constructor(private readonly _useCases: UsersUseCases) {}

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getMe.execute(getAuthUser(req).userId)

      res.json(new ApiResponse('Current user profile fetched', result))
    } catch (error) {
      next(error)
    }
  }

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.updateMe.execute(
        getAuthUser(req).userId,
        req.body
      )

      res.json(new ApiResponse('Profile updated successfully', result))
    } catch (error) {
      next(error)
    }
  }

  getUserByUsername = async (
    req: Request<UsernameParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getUserByUsername.execute(req.params.username)

      res.json(new ApiResponse('User fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getPublicProfile = async (
    req: Request<UsernameParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getPublicProfilePage.execute(
        req.params.username,
        req.user?.userId,
        this.buildTrackerPaginationQuery(req)
      )

      res.json(new ApiResponse('Public profile fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getMyStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getMyStats.execute(getAuthUser(req).userId)

      res.json(new ApiResponse('Stats fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getMyRecentActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getMyRecentActivity.execute(
        getAuthUser(req).userId,
        this.clampInteger(
          req.query.limit,
          USERS_DEFAULT_LIMIT,
          1,
          USERS_MAX_LIMIT
        )
      )

      res.json(new ApiResponse('Recent activity fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getMyStreak = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentYear = new Date().getUTCFullYear()
      const year =
        typeof req.query.year === 'string'
          ? this.clampInteger(
              req.query.year,
              currentYear,
              USERS_MIN_STREAK_YEAR,
              currentYear + 1
            )
          : undefined

      const result = await this._useCases.getMyStreak.execute(
        getAuthUser(req).userId,
        year
      )

      res.json(new ApiResponse('Streak fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getMyPublishedTrackers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getMyPublishedTrackers.execute(
        getAuthUser(req).userId,
        this.buildTrackerPaginationQuery(req)
      )

      res.json(new ApiResponse('Published trackers fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getMyBadges = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getMyBadges.execute(
        getAuthUser(req).userId,
        this.clampInteger(req.query.page, 1, 1, USERS_MAX_PAGE),
        this.clampInteger(
          req.query.limit,
          USERS_DEFAULT_LIMIT,
          1,
          USERS_MAX_LIMIT
        )
      )

      res.json(new ApiResponse('Badges fetched', result))
    } catch (error) {
      next(error)
    }
  }

  private clampInteger(
    value: unknown,
    fallback: number,
    minimum: number,
    maximum: number
  ): number {
    const parsed = Number(value)

    if (!Number.isInteger(parsed)) {
      return fallback
    }

    return Math.min(Math.max(parsed, minimum), maximum)
  }

  private normalizeSearch(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined
    }

    const trimmed = value.trim().slice(0, USERS_MAX_SEARCH_LENGTH)

    return trimmed || undefined
  }

  private normalizeStatus(value: unknown): IPaginationQueryDTO['status'] {
    return value === 'active' || value === 'draft' || value === 'archived'
      ? value
      : undefined
  }

  private normalizeSort(value: unknown): ProfileSort {
    return value === 'createdAt' ||
      value === 'publishedAt' ||
      value === 'ratingAverage' ||
      value === 'cloneCount'
      ? value
      : 'publishedAt'
  }

  private buildTrackerPaginationQuery(req: Request): IPaginationQueryDTO {
    const search = this.normalizeSearch(req.query.search)
    const status = this.normalizeStatus(req.query.status)

    return {
      page: this.clampInteger(req.query.page, 1, 1, USERS_MAX_PAGE),
      limit: this.clampInteger(
        req.query.limit,
        USERS_DEFAULT_LIMIT,
        1,
        USERS_MAX_LIMIT
      ),
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      sort: this.normalizeSort(req.query.sort),
    }
  }
}
