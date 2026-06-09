// apps/api/src/modules/mock-tests/presentation/mock-tests.controller.ts

import { Request, Response, NextFunction } from 'express'

import { mockTestsService } from '../mock-tests.service'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { ApiError } from '../../../shared/utils/ApiError'

import type { DifficultyLevel } from '../domain/types/mock-tests.types'

type AuthenticatedRequestUser = {
  userId?: string
}

type ListTestsQuery = {
  page?: number
  limit?: number
}

type PublicTestsQuery = {
  difficulty?: DifficultyLevel
  tags?: string[]
  page?: number
  limit?: number
}

const getAuthUserId = (req: Request): string => {
  const user = req.user as AuthenticatedRequestUser | undefined

  if (!user?.userId) {
    throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED')
  }

  return user.userId
}

const getParam = (
  value: string | string[] | undefined,
  name: string
): string => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }

  if (!value) {
    throw new ApiError(400, `${name} is required`, 'VALIDATION_ERROR')
  }

  return value
}

const parseStringQuery = (
  value: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

const parseNumberQuery = (
  value: string | string[] | undefined
): number | undefined => {
  const raw = parseStringQuery(value)

  if (!raw) return undefined

  const parsed = Number(raw)

  return Number.isFinite(parsed) ? parsed : undefined
}

const parseTagsQuery = (
  value: string | string[] | undefined
): string[] | undefined => {
  if (!value) return undefined

  const tags = Array.isArray(value) ? value : value.split(',')

  const cleaned = tags
    .map((tag) => tag.trim())
    .filter(Boolean)

  return cleaned.length ? cleaned : undefined
}

const parseListTestsQuery = (req: Request): ListTestsQuery => {
  return {
    page: parseNumberQuery(req.query.page as string | string[] | undefined),
    limit: parseNumberQuery(req.query.limit as string | string[] | undefined),
  }
}

const parsePublicTestsQuery = (req: Request): PublicTestsQuery => {
  const difficulty = parseStringQuery(
    req.query.difficulty as string | string[] | undefined
  )

  return {
    difficulty:
      difficulty === 'easy' ||
      difficulty === 'medium' ||
      difficulty === 'hard'
        ? difficulty
        : undefined,

    tags: parseTagsQuery(req.query.tags as string | string[] | undefined),

    page: parseNumberQuery(req.query.page as string | string[] | undefined),

    limit: parseNumberQuery(req.query.limit as string | string[] | undefined),
  }
}

export const mockTestsController = {
  listTests: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const options = parseListTestsQuery(req)

      const data = await mockTestsService.listTests(userId, options)

      res.json(new ApiResponse('Tests fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  listPublicTests: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filters = parsePublicTestsQuery(req)
      const data = await mockTestsService.listPublicTests(filters)

      res.json(new ApiResponse('Public tests fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  createTest: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const data = await mockTestsService.createTest(userId, req.body)

      res.status(201).json(new ApiResponse('Test created', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  generateTest: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const data = await mockTestsService.generateTest(userId, req.body)

      res.status(201).json(new ApiResponse('Test generated', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  getTest: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const testId = getParam(req.params.testId, 'testId')

      const data = await mockTestsService.getTest(testId, userId)

      res.json(new ApiResponse('Test fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  startAttempt: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const testId = getParam(req.params.testId, 'testId')

      const data = await mockTestsService.startAttempt(testId, userId)

      res.json(new ApiResponse('Test started', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  getAttemptQuestions: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const attemptId = getParam(req.params.attemptId, 'attemptId')

      const data = await mockTestsService.getAttemptQuestions(
        attemptId,
        userId
      )

      res.json(new ApiResponse('Questions fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  submitAnswer: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const attemptId = getParam(req.params.attemptId, 'attemptId')

      const data = await mockTestsService.submitAnswer(
        attemptId,
        userId,
        req.body
      )

      res.json(new ApiResponse('Answer submitted', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  flagQuestion: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const attemptId = getParam(req.params.attemptId, 'attemptId')

      const data = await mockTestsService.flagQuestion(
        attemptId,
        userId,
        req.body.questionId
      )

      res.json(new ApiResponse('Question flag toggled', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  finishAttempt: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const attemptId = getParam(req.params.attemptId, 'attemptId')

      const data = await mockTestsService.finishAttempt(attemptId, userId)

      res.json(new ApiResponse('Test finished', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  getAttemptResult: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const attemptId = getParam(req.params.attemptId, 'attemptId')

      const data = await mockTestsService.getAttemptResult(
        attemptId,
        userId
      )

      res.json(new ApiResponse('Result fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  getAttemptAnalysis: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const attemptId = getParam(req.params.attemptId, 'attemptId')

      const data = await mockTestsService.getAttemptAnalysis(
        attemptId,
        userId
      )

      res.json(new ApiResponse('Analysis fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  retakeTest: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const attemptId = getParam(req.params.attemptId, 'attemptId')

      const data = await mockTestsService.retakeTest(attemptId, userId)

      res.json(new ApiResponse('Retake started', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  getHistory: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const data = await mockTestsService.getHistory(userId)

      res.json(new ApiResponse('History fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  getAnalytics: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const data = await mockTestsService.getAnalytics(userId)

      res.json(new ApiResponse('Analytics fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  getAIInsights: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const data = await mockTestsService.getAIInsights(userId)

      res.json(new ApiResponse('AI insights fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  getTopicBreakdown: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const data = await mockTestsService.getTopicBreakdown(userId)

      res.json(new ApiResponse('Topic breakdown fetched', data))
    } catch (error: unknown) {
      next(error)
    }
  },

    shareTest: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const testId = getParam(req.params.testId, 'testId')

      const origin =
        req.get('origin') ||
        `${req.protocol}://${req.get('host')}`

      const data = await mockTestsService.shareTest(
        userId,
        testId,
        origin
      )

      res.json(new ApiResponse('Share link created', data))
    } catch (error: unknown) {
      next(error)
    }
  },

  importSharedTest: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = getAuthUserId(req)
      const shareToken = getParam(req.params.shareToken, 'shareToken')

      const data = await mockTestsService.importSharedTest(
        userId,
        shareToken
      )

      res.status(201).json(new ApiResponse('Shared test imported', data))
    } catch (error: unknown) {
      next(error)
    }
  },
  runCode: async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthUserId(req)
    const attemptId = getParam(req.params.attemptId, 'attemptId')
    const questionId = getParam(req.params.questionId, 'questionId')

    const data = await mockTestsService.runCode(
      attemptId,
      userId,
      questionId,
      req.body,
    )

    res.json(new ApiResponse('Code executed', data))
  } catch (error: unknown) {
    next(error)
  }
},

submitCode: async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthUserId(req)
    const attemptId = getParam(req.params.attemptId, 'attemptId')
    const questionId = getParam(req.params.questionId, 'questionId')

    const data = await mockTestsService.submitCode(
      attemptId,
      userId,
      questionId,
      req.body,
    )

    res.json(new ApiResponse('Code submitted', data))
  } catch (error: unknown) {
    next(error)
  }
},
}