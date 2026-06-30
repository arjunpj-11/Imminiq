import type { NextFunction, Request, Response } from 'express'

import type { CommunitySort } from '../domain/value-objects/community-sort.vo'
import { communityService, type CommunityService } from '../community.service'
import type {
  UpsertCommunityTrackerReviewInput,
  VoteVerificationSubmissionInput,
  SendTrackerForVerificationInput,
} from './community.schema'
import { ApiError } from '../../../shared/utils/ApiError'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import { HttpStatusCode } from '../../../shared/constants/http-status-code.enum'

export class CommunityController {
  constructor(private readonly _service: CommunityService) {}

  getBrowse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthUser(req)
      const result = await this._service.getBrowse({
        userId: user.userId,
        ...this.getTrackerQuery(req),
      })

      res.json(new ApiResponse('Community browse data fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getTrackers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthUser(req)
      const result = await this._service.getTrackers({
        userId: user.userId,
        ...this.getTrackerQuery(req),
      })

      res.json(new ApiResponse('Community trackers fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getPublicTrackerDetail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = getAuthUser(req)
      const trackerId = this.getRequiredParam(req, 'trackerId')
      const tracker = await this._service.getPublicTrackerDetail(
        trackerId,
        user.userId,
      )

      res.json(new ApiResponse('Community tracker fetched', { tracker }))
    } catch (error) {
      next(error)
    }
  }

  getTopics = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const topics = await this._service.getTopics()

      res.json(new ApiResponse('Community topics fetched', { topics }))
    } catch (error) {
      next(error)
    }
  }

  getPersonalStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = getAuthUser(req)
      const stats = await this._service.getPersonalStats(user.userId)

      res.json(new ApiResponse('Community stats fetched', { stats }))
    } catch (error) {
      next(error)
    }
  }

  cloneTracker = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthUser(req)
      const trackerId = this.getRequiredParam(req, 'trackerId')
      const tracker = await this._service.cloneTracker(trackerId, user.userId)

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Tracker cloned to dashboard', { tracker }))
    } catch (error) {
      next(error)
    }
  }

  submitTrackerForVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('submitTrackerForVerification called with body:', req.body);
    const user = getAuthUser(req)
    const trackerId = this.getRequiredParam(req, 'trackerId')
    const body = req.body as SendTrackerForVerificationInput

    const submission = await this._service.submitTrackerForVerification({
      trackerId,
      userId: user.userId,
      requiredVotes: body.requiredVotes,
      durationHours: body.durationHours,
      urgent: body.urgent,
    })

    console.log('submitTrackerForVerification result:', submission);

    res
      .status(HttpStatusCode.CREATED)
      .json(
        new ApiResponse('Tracker sent for verification', { submission }),
      )
  } catch (error) {
    next(error)
  }
}

  upsertTrackerReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = getAuthUser(req)
      const trackerId = this.getRequiredParam(req, 'trackerId')
      const body = req.body as UpsertCommunityTrackerReviewInput
      const result = await this._service.upsertTrackerReview({
        trackerId,
        userId: user.userId,
        rating: body.rating,
        comment: body.comment,
      })

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Review submitted', result))
    } catch (error) {
      next(error)
    }
  }

  toggleReviewHelpful = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = getAuthUser(req)
      const reviewId = this.getRequiredParam(req, 'reviewId')
      const result = await this._service.toggleReviewHelpful({
        reviewId,
        userId: user.userId,
      })

      res.json(new ApiResponse('Review helpful state updated', result))
    } catch (error) {
      next(error)
    }
  }

  getVerificationDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = getAuthUser(req)
      const result = await this._service.getVerificationDashboard({
        userId: user.userId,
        page: this.getNumberQuery(req, 'page'),
        limit: this.getNumberQuery(req, 'limit'),
      })

      res.json(new ApiResponse('Verification dashboard fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getVerificationQueue = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = getAuthUser(req)
      const result = await this._service.getVerificationQueue({
        userId: user.userId,
        page: this.getNumberQuery(req, 'page'),
        limit: this.getNumberQuery(req, 'limit'),
      })

      res.json(new ApiResponse('Verification queue fetched', result))
    } catch (error) {
      next(error)
    }
  }

  getVerificationLeaderboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = getAuthUser(req)
      const leaderboard = await this._service.getVerificationLeaderboard(
        user.userId,
        this.getNumberQuery(req, 'limit'),
      )

      res.json(
        new ApiResponse('Verification leaderboard fetched', { leaderboard }),
      )
    } catch (error) {
      next(error)
    }
  }

  getVerificationSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = getAuthUser(req)
      const submissionId = this.getRequiredParam(req, 'submissionId')
      const submission = await this._service.getVerificationSubmission(
        submissionId,
        user.userId,
      )

      res.json(
        new ApiResponse('Verification submission fetched', { submission }),
      )
    } catch (error) {
      next(error)
    }
  }

  toggleTrackerLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getAuthUser(req)
    const trackerId = this.getRequiredParam(req, 'trackerId')

    const result = await this._service.toggleTrackerLike({
      trackerId,
      userId: user.userId,
    })

    res.json(new ApiResponse('Tracker like status updated', result))
  } catch (error) {
    next(error)
  }
}

  voteVerificationSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = getAuthUser(req)
      const submissionId = this.getRequiredParam(req, 'submissionId')
      const body = req.body as VoteVerificationSubmissionInput
      const result = await this._service.voteVerificationSubmission({
        submissionId,
        userId: user.userId,
        vote: body.vote,
        reason: body.reason || null,
      })

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Verification vote submitted', result))
    } catch (error) {
      next(error)
    }
  }

  private getTrackerQuery(req: Request) {
    return {
      search: this.getStringQuery(req, 'search'),
      topics: this.getStringArrayQuery(req, 'topics'),
      minRating: this.getNumberQuery(req, 'minRating'),
      verifiedOnly: this.getBooleanQuery(req, 'verifiedOnly'),
      sort: this.getSortQuery(req),
      page: this.getNumberQuery(req, 'page'),
      limit: this.getNumberQuery(req, 'limit'),
    }
  }

  private getRequiredParam(req: Request, key: string): string {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        `${key} is required`,
        'COMMUNITY_PARAM_REQUIRED',
      )
    }

    return value
  }

  private getStringQuery(req: Request, key: string): string | undefined {
    const value = req.query[key]

    if (typeof value !== 'string') {
      return undefined
    }

    const clean = value.trim()

    return clean || undefined
  }

  private getStringArrayQuery(req: Request, key: string): string[] | undefined {
    const value = req.query[key]

    if (Array.isArray(value)) {
      return value
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean)
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }

    return undefined
  }

  private getNumberQuery(req: Request, key: string): number | undefined {
    const value = req.query[key]

    if (Array.isArray(value) || value === undefined) {
      return undefined
    }

    const numeric = Number(value)

    if (!Number.isFinite(numeric)) {
      return undefined
    }

    return numeric
  }

  private getBooleanQuery(req: Request, key: string): boolean | undefined {
    const value = req.query[key]

    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }

    return undefined
  }

  private getSortQuery(req: Request): CommunitySort | undefined {
    const value = this.getStringQuery(req, 'sort')

    if (value === 'top-rated' || value === 'most-cloned' || value === 'newest') {
      return value
    }

    return undefined
  }
}

export const communityController = new CommunityController(communityService)
