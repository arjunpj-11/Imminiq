import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../../shared/utils/getAuthUser';
import type { TrackerUseCases } from '../application/tracker-use-cases.contract';

type TrackerParams = { trackerId: string };
type ClanRequestParams = { trackerId: string; requestId: string };
type ClanMemberParams = { trackerId: string; memberId: string };

export class TrackerClanController {
  constructor(private readonly useCases: TrackerUseCases) {}

  getOverview = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClan.getOverview({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Tracker clan fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  join = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClan.requestJoin({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });
      res.status(HttpStatusCode.CREATED).json(new ApiResponse('Joined tracker guild', result));
    } catch (error) {
      next(error);
    }
  };

  reviewJoin = async (req: Request<ClanRequestParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClan.reviewJoin({
        trackerId: req.params.trackerId,
        requestId: req.params.requestId,
        userId: getAuthUser(req).userId,
        action: req.body.action,
      });
      res.json(new ApiResponse('Clan join request reviewed', result));
    } catch (error) {
      next(error);
    }
  };

  updateMember = async (req: Request<ClanMemberParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClan.updateMemberRole({
        trackerId: req.params.trackerId,
        memberId: req.params.memberId,
        userId: getAuthUser(req).userId,
        role: req.body.role,
      });
      res.json(new ApiResponse('Clan role updated', result));
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req: Request<ClanMemberParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClan.removeMember({
        trackerId: req.params.trackerId,
        memberId: req.params.memberId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Clan member removed', result));
    } catch (error) {
      next(error);
    }
  };

  leave = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClan.leaveClan({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Left tracker guild', result));
    } catch (error) {
      next(error);
    }
  };

  transferOwnership = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClan.transferOwnership({
        trackerId: req.params.trackerId,
        newOwnerId: req.body.newOwnerId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Clan ownership transferred', result));
    } catch (error) {
      next(error);
    }
  };

  listMessages = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this.useCases.trackerClan.listMessages({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        limit: Number(req.query.limit) || 60,
      });
      res.json(new ApiResponse('Guild chat history fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };
}
