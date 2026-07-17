import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../../shared/utils/getAuthUser';
import type { TrackerCreationUseCases } from '../application/tracker-creation-use-cases.contract';

type JobIdParams = {
  jobId: string;
};

type TrackerIdParams = { trackerId: string };

export class TrackerCreationController {
  constructor(private readonly _useCases: TrackerCreationUseCases) {}

  continueTrackerIntake = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.continueTrackerIntake.execute(
        getAuthUser(req).userId,
        req.body.messages
      );
      res.json(new ApiResponse('Tracker intake continued', data));
    } catch (error) {
      next(error);
    }
  };

  saveStep1 = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.saveTrackerCreationStepOne.execute(
        getAuthUser(req).userId,
        req.body
      );

      res.json(new ApiResponse('Step 1 saved', data));
    } catch (error) {
      next(error);
    }
  };

  saveStep2 = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.saveTrackerCreationStepTwo.execute(
        getAuthUser(req).userId,
        req.body
      );

      res.json(new ApiResponse('Step 2 saved', data));
    } catch (error) {
      next(error);
    }
  };

  generateRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.generateRoadmap.execute(
        getAuthUser(req).userId,
        req.body
      );

      res
        .status(HttpStatusCode.ACCEPTED)
        .json(new ApiResponse('Roadmap generation started', result));
    } catch (error) {
      next(error);
    }
  };

  getActiveRoadmapJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getActiveRoadmapJob.execute(getAuthUser(req).userId);
      res.json(new ApiResponse('Active roadmap job fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getJobStatus = async (req: Request<JobIdParams>, res: Response, next: NextFunction) => {
    try {
      const status = await this._useCases.getRoadmapJobStatus.execute(
        req.params.jobId,
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Job status', status));
    } catch (error) {
      next(error);
    }
  };

  getJobResult = async (req: Request<JobIdParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getRoadmapJobResult.execute(
        req.params.jobId,
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Roadmap ready', result));
    } catch (error) {
      next(error);
    }
  };

  evaluateRoadmap = async (req: Request<JobIdParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.evaluateRoadmap.execute(
        req.params.jobId,
        getAuthUser(req).userId
      );

      res
        .status(HttpStatusCode.ACCEPTED)
        .json(new ApiResponse('Roadmap evaluation started', result));
    } catch (error) {
      next(error);
    }
  };

  getEvaluationResult = async (req: Request<JobIdParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getRoadmapEvaluationResult.execute(
        req.params.jobId,
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Roadmap evaluation ready', result));
    } catch (error) {
      next(error);
    }
  };

  analyzeClonedTracker = async (
    req: Request<TrackerIdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.analyzeClonedTracker.execute(
        req.params.trackerId,
        getAuthUser(req).userId
      );
      res
        .status(HttpStatusCode.ACCEPTED)
        .json(new ApiResponse('New-topic analysis started', result));
    } catch (error) {
      next(error);
    }
  };
}
