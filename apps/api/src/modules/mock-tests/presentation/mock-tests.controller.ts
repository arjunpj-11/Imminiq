import type { NextFunction, Request, Response } from 'express'

import type { DifficultyLevel } from '../application/dtos/mock-tests.dto'
import { mockTestsService, type MockTestsService } from '../mock-tests.service'
import { ApiError } from '../../../shared/utils/ApiError'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'

type ListTestsQuery = { page?: number; limit?: number }
type PublicTestsQuery = {
  difficulty?: DifficultyLevel
  tags?: string[]
  page?: number
  limit?: number
}

export class MockTestsController {
  constructor(private readonly service: MockTestsService) { }

  listTests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId
      const data = await this.service.listTests(
        userId,
        this.parseListTestsQuery(req),
      )
      res.json(new ApiResponse('Tests fetched', data))
    } catch (error) {
      next(error)
    }
  }

  listPublicTests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listPublicTests(
        this.parsePublicTestsQuery(req),
      )
      res.json(new ApiResponse('Public tests fetched', data))
    } catch (error) {
      next(error)
    }
  }

  createTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.createTest(
        getAuthUser(req).userId,
        req.body,
      )
      res.status(201).json(new ApiResponse('Test created', data))
    } catch (error) {
      next(error)
    }
  }

  generateTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.generateTest(
        getAuthUser(req).userId,
        req.body,
      )
      res.status(201).json(new ApiResponse('Test generated', data))
    } catch (error) {
      next(error)
    }
  }

  getTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getTest(
        this.getParam(req.params.testId, 'testId'),
        getAuthUser(req).userId,
      )
      res.json(new ApiResponse('Test fetched', data))
    } catch (error) {
      next(error)
    }
  }

  startAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.startAttempt(
        this.getParam(req.params.testId, 'testId'),
        getAuthUser(req).userId,
      )
      res.json(new ApiResponse('Test started', data))
    } catch (error) {
      next(error)
    }
  }

  getAttemptQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAttemptQuestions(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
      )
      res.json(new ApiResponse('Questions fetched', data))
    } catch (error) {
      next(error)
    }
  }

  submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.submitAnswer(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
        req.body,
      )
      res.json(new ApiResponse('Answer submitted', data))
    } catch (error) {
      next(error)
    }
  }

  flagQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.flagQuestion(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
        req.body.questionId,
      )
      res.json(new ApiResponse('Question flag toggled', data))
    } catch (error) {
      next(error)
    }
  }

  finishAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.finishAttempt(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
      )
      res.json(new ApiResponse('Test finished', data))
    } catch (error) {
      next(error)
    }
  }

  getAttemptResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAttemptResult(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
      )
      res.json(new ApiResponse('Result fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getAttemptAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAttemptAnalysis(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
      )
      res.json(new ApiResponse('Analysis fetched', data))
    } catch (error) {
      next(error)
    }
  }

  retakeTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.retakeTest(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
      )
      res.json(new ApiResponse('Retake started', data))
    } catch (error) {
      next(error)
    }
  }

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getHistory(getAuthUser(req).userId)
      res.json(new ApiResponse('History fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAnalytics(getAuthUser(req).userId)
      res.json(new ApiResponse('Analytics fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getAIInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAIInsights(getAuthUser(req).userId)
      res.json(new ApiResponse('AI insights fetched', data))
    } catch (error) {
      next(error)
    }
  }

  getTopicBreakdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getTopicBreakdown(getAuthUser(req).userId)
      res.json(new ApiResponse('Topic breakdown fetched', data))
    } catch (error) {
      next(error)
    }
  }

  shareTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`
      const data = await this.service.shareTest(
        getAuthUser(req).userId,
        this.getParam(req.params.testId, 'testId'),
        origin,
      )
      res.json(new ApiResponse('Share link created', data))
    } catch (error) {
      next(error)
    }
  }

  importSharedTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.importSharedTest(
        getAuthUser(req).userId,
        this.getParam(req.params.shareToken, 'shareToken'),
      )
      res.status(201).json(new ApiResponse('Shared test imported', data))
    } catch (error) {
      next(error)
    }
  }

  runCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.runCode(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
        this.getParam(req.params.questionId, 'questionId'),
        req.body,
      )
      res.json(new ApiResponse('Code executed', data))
    } catch (error) {
      next(error)
    }
  }

  submitCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.submitCode(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
        this.getParam(req.params.questionId, 'questionId'),
        req.body,
      )
      res.json(new ApiResponse('Code submitted', data))
    } catch (error) {
      next(error)
    }
  }

  private getParam(value: string | string[] | undefined, name: string): string {
    const resolved = Array.isArray(value) ? value[0] : value

    if (!resolved) {
      throw new ApiError(400, `${name} is required`, 'VALIDATION_ERROR')
    }

    return resolved
  }

  private parseStringQuery(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      return typeof value[0] === 'string' ? value[0] : undefined
    }

    return typeof value === 'string' ? value : undefined
  }

  private parseNumberQuery(value: unknown): number | undefined {
    const raw = this.parseStringQuery(value)
    if (!raw) return undefined

    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  private parseTagsQuery(value: unknown): string[] | undefined {
    if (!value) return undefined

    const values = Array.isArray(value) ? value : String(value).split(',')
    const tags = values
      .filter((item): item is string => typeof item === 'string')
      .map((tag) => tag.trim())
      .filter(Boolean)

    return tags.length ? tags : undefined
  }

  private parseListTestsQuery(req: Request): ListTestsQuery {
    return {
      page: this.parseNumberQuery(req.query.page),
      limit: this.parseNumberQuery(req.query.limit),
    }
  }

  private parsePublicTestsQuery(req: Request): PublicTestsQuery {
    const difficulty = this.parseStringQuery(req.query.difficulty)

    return {
      difficulty:
        difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard'
          ? difficulty
          : undefined,
      tags: this.parseTagsQuery(req.query.tags),
      page: this.parseNumberQuery(req.query.page),
      limit: this.parseNumberQuery(req.query.limit),
    }
  }
}

export const mockTestsController = new MockTestsController(mockTestsService)
