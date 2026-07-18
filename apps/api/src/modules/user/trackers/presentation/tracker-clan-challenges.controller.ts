import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../../shared/utils/getAuthUser';
import type { TrackerUseCases } from '../application/tracker-use-cases.contract';

type TrackerParams = { trackerId: string };
type ChallengeParams = { trackerId: string; challengeId: string };

export class TrackerClanChallengesController {
  constructor(private readonly useCases: TrackerUseCases) {}

  list = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClanChallenges.list({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Guild challenges fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClanChallenges.create({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        opponentId: req.body.opponentId,
        durationMinutes: req.body.durationMinutes,
        questionCount: req.body.questionCount,
      });
      res.status(HttpStatusCode.CREATED).json(new ApiResponse('Guild challenge created', result));
    } catch (error) {
      next(error);
    }
  };

  accept = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClanChallenges.accept({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Guild challenge accepted', result));
    } catch (error) {
      next(error);
    }
  };

  decline = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClanChallenges.decline({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Guild challenge declined', result));
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClanChallenges.cancel({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Guild challenge cancelled', result));
    } catch (error) {
      next(error);
    }
  };

  submit = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClanChallenges.submit({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
        answers: req.body.answers,
      });
      res.json(new ApiResponse('Battle answers submitted', result));
    } catch (error) {
      next(error);
    }
  };
}
