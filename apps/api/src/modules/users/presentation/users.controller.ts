import type { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { usersService } from '../application/services/users.service'
import type {
  PaginationQuery,
  ProfileSort,
} from '../domain/types/users.types'

const MAX_PAGE = 100_000
const MAX_LIMIT = 50
const MAX_SEARCH_LENGTH = 80

const requireUserId = (req: Request) => {
  const userId = req.user?.userId

  if (!userId) {
    throw new Error('Authenticated user id is missing')
  }

  return userId
}

type UsernameParams = {
  username: string
}

const clampInteger = (
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number
) => {
  const parsed =
    typeof value === 'string'
      ? Number(value)
      : Number(value ?? fallback)

  if (!Number.isInteger(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, minimum), maximum)
}

const normalizeSearch = (
  value: unknown
): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim().slice(0, MAX_SEARCH_LENGTH)

  return trimmed || undefined
}

const normalizeStatus = (
  value: unknown
): PaginationQuery['status'] => {
  return value === 'active' ||
    value === 'draft' ||
    value === 'archived'
    ? value
    : undefined
}

const normalizeSort = (
  value: unknown
): ProfileSort => {
  return value === 'createdAt' ||
    value === 'publishedAt' ||
    value === 'ratingAverage' ||
    value === 'cloneCount'
    ? value
    : 'publishedAt'
}

const buildTrackerPaginationQuery = (
  req: Request
): PaginationQuery => {
  return {
    page: clampInteger(req.query.page, 1, 1, MAX_PAGE),
    limit: clampInteger(req.query.limit, 10, 1, MAX_LIMIT),
    search: normalizeSearch(req.query.search),
    status: normalizeStatus(req.query.status),
    sort: normalizeSort(req.query.sort),
  }
}

export const usersController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.getMe(requireUserId(req))

      res
        .status(200)
        .json(
          new ApiResponse(
            'Current user profile fetched',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.updateMe(
        requireUserId(req),
        req.body
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            'Profile updated successfully',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async getUserByUsername(
    req: Request<UsernameParams>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await usersService.getUserByUsername(
        req.params.username
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            'User fetched',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async getPublicProfile(
    req: Request<UsernameParams>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await usersService.getPublicProfilePage(
        req.params.username,
        req.user?.userId,
        buildTrackerPaginationQuery(req)
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            'Public profile fetched',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async getMyStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.getMyStats(requireUserId(req))

      res
        .status(200)
        .json(
          new ApiResponse(
            'Stats fetched',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async getMyActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.getMyActivity(
        requireUserId(req),
        clampInteger(req.query.page, 1, 1, MAX_PAGE),
        clampInteger(req.query.limit, 10, 1, MAX_LIMIT)
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            'Activity feed fetched',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async getMyRecentActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await usersService.getMyRecentActivity(
        requireUserId(req),
        clampInteger(req.query.limit, 10, 1, MAX_LIMIT)
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            'Recent activity fetched',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async getMyStreak(req: Request, res: Response, next: NextFunction) {
    try {
      const currentYear = new Date().getUTCFullYear()
      const year =
        typeof req.query.year === 'string'
          ? clampInteger(req.query.year, currentYear, 2000, currentYear + 1)
          : undefined

      const result = await usersService.getMyStreak(
        requireUserId(req),
        year
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            'Streak fetched',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async getMyPublishedTrackers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await usersService.getMyPublishedTrackers(
        requireUserId(req),
        buildTrackerPaginationQuery(req)
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            'Published trackers fetched',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },

  async getMyBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.getMyBadges(
        requireUserId(req),
        clampInteger(req.query.page, 1, 1, MAX_PAGE),
        clampInteger(req.query.limit, 10, 1, MAX_LIMIT)
      )

      res
        .status(200)
        .json(
          new ApiResponse(
            'Badges fetched',
            result
          )
        )
    } catch (error) {
      next(error)
    }
  },
}
