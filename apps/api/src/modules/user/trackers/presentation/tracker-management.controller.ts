import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiResponse } from '../../../../shared/utils/api-response';
import { getAuthUser } from '../../../../shared/utils/get-auth-user';
import type { TrackerUseCases } from '../application/tracker-use-cases.contract';

type TrackerParams = { trackerId: string };
type TrackerListQuery = Omit<Parameters<TrackerUseCases['listTrackers']['execute']>[0], 'userId'>;

export class TrackerManagementController {
  constructor(private readonly _useCases: TrackerUseCases) {}

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getTrackerSummary.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('Tracker summary fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  listDomains = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = res.locals.trackerDomainsQuery as { search: string };
      const result = await this._useCases.listTrackerDomains.execute(query.search);
      res.json(new ApiResponse('Tracker domains fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  listTrackers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = res.locals.trackerListQuery as TrackerListQuery;

      const result = await this._useCases.listTrackers.execute({
        userId: getAuthUser(req).userId,
        status: query.status || 'all',
        domain: query.domain || 'all',
        sortBy: query.sortBy || 'lastActive',
        page: query.page || 1,
        limit: query.limit || 12,
      });

      res.json(new ApiResponse('Trackers fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  createTracker = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.createTracker.execute({
        userId: getAuthUser(req).userId,
        ...req.body,
      });

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Tracker created successfully', result));
    } catch (error) {
      next(error);
    }
  };

  getTrackerDetails = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getTrackerDetails.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Tracker fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  reportTracker = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.reportTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        reason: req.body.reason,
        details: req.body.details,
      });
      res.status(HttpStatusCode.CREATED).json(new ApiResponse('Tracker report submitted', result));
    } catch (error) {
      next(error);
    }
  };

  updateTracker = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.updateTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        ...req.body,
      });

      res.json(new ApiResponse('Tracker updated successfully', result));
    } catch (error) {
      next(error);
    }
  };

  deleteTracker = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.deleteTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Tracker deleted successfully', result));
    } catch (error) {
      next(error);
    }
  };

  archiveTracker = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.archiveTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Tracker archived successfully', result));
    } catch (error) {
      next(error);
    }
  };

  restoreTracker = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.restoreTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Tracker restored successfully', result));
    } catch (error) {
      next(error);
    }
  };

  publishTracker = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const { name, description, domain, difficulty, tags, allowClone } = req.body;

      const result = await this._useCases.publishTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        name,
        description,
        domain,
        difficulty,
        tags,
        allowClone,
      });

      res.json(new ApiResponse('Tracker published successfully', result));
    } catch (error) {
      next(error);
    }
  };

  unpublishTracker = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.unpublishTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Tracker unpublished successfully', result));
    } catch (error) {
      next(error);
    }
  };

}

