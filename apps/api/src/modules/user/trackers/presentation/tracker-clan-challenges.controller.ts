import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiResponse } from '../../../../shared/utils/api-response';
import { getAuthUser } from '../../../../shared/utils/get-auth-user';
import type { TrackerUseCases } from '../application/tracker-use-cases.contract';

type TrackerParams = { trackerId: string };
type ChallengeParams = { trackerId: string; challengeId: string };

export class TrackerClanChallengesController {
  constructor(private readonly _useCases: TrackerUseCases) {}

  list = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.list({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Guild challenges fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.get({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Guild challenge fetched', result));
    } catch (error) {
      next(error);
    }
  };

  history = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.history({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Guild challenge history fetched', result));
    } catch (error) {
      next(error);
    }
  };

  active = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.active(getAuthUser(req).userId);
      res.json(new ApiResponse('Active guild challenge fetched', result));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.create({
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
      const result = await this._useCases.trackerClanChallenges.accept({
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
      const result = await this._useCases.trackerClanChallenges.decline({
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
      const result = await this._useCases.trackerClanChallenges.cancel({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Guild challenge cancelled', result));
    } catch (error) {
      next(error);
    }
  };

  quit = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.quit({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Guild challenge quit', result));
    } catch (error) {
      next(error);
    }
  };

  extend = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.extend({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
        questionCount: req.body.questionCount,
      });
      res.json(new ApiResponse('Extra battle questions added', result));
    } catch (error) {
      next(error);
    }
  };

  submit = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.submit({
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

  chooseCheckpoint = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.chooseCheckpoint({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
        decision: req.body.decision,
      });
      res.json(new ApiResponse('Checkpoint decision saved', result));
    } catch (error) {
      next(error);
    }
  };

  answerNode = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.answerNode({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
        questionId: req.body.questionId,
        answer: req.body.answer,
      });
      res.json(new ApiResponse('Node answer checked', result));
    } catch (error) {
      next(error);
    }
  };

  usePower = async (req: Request<ChallengeParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClanChallenges.usePower({
        trackerId: req.params.trackerId,
        challengeId: req.params.challengeId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Push-back power used', result));
    } catch (error) {
      next(error);
    }
  };
}
