import type { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../../shared/utils/ApiResponse'
import { usersService } from './users.service'

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
        {
          page: Number(req.query.page ?? 1),
          limit: Number(req.query.limit ?? 10),

          search:
            typeof req.query.search === 'string'
              ? req.query.search
              : undefined,

          status:
            typeof req.query.status === 'string'
              ? (req.query.status as
                  | 'active'
                  | 'draft'
                  | 'archived')
              : undefined,

          sort:
            typeof req.query.sort === 'string'
              ? (req.query.sort as
                  | 'createdAt'
                  | 'publishedAt'
                  | 'ratingAverage'
                  | 'cloneCount')
              : 'publishedAt',
        }
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
        Number(req.query.page ?? 1),
        Number(req.query.limit ?? 10)
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
        Number(req.query.limit ?? 10)
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
      const year =
        typeof req.query.year === 'string'
          ? Number(req.query.year)
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
        {
          page: Number(req.query.page ?? 1),
          limit: Number(req.query.limit ?? 10),

          search:
            typeof req.query.search === 'string'
              ? req.query.search
              : undefined,

          status:
            typeof req.query.status === 'string'
              ? (req.query.status as
                  | 'active'
                  | 'draft'
                  | 'archived')
              : undefined,

          sort:
            typeof req.query.sort === 'string'
              ? (req.query.sort as
                  | 'createdAt'
                  | 'publishedAt'
                  | 'ratingAverage'
                  | 'cloneCount')
              : 'publishedAt',
        }
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
        Number(req.query.page ?? 1),
        Number(req.query.limit ?? 10)
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