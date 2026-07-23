import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiResponse } from '../../../../shared/utils/api-response';
import { getAuthUser } from '../../../../shared/utils/get-auth-user';
import type { TrackerUseCases } from '../application/tracker-use-cases.contract';

type TrackerParams = { trackerId: string };
type ClanRequestParams = { trackerId: string; requestId: string };
type ClanMemberParams = { trackerId: string; memberId: string };
type ClanRoleInvitationParams = { trackerId: string; invitationId: string };

export class TrackerClanController {
  constructor(private readonly _useCases: TrackerUseCases) {}

  getOverview = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClan.getOverview({
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
      const result = await this._useCases.trackerClan.requestJoin({
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
      const result = await this._useCases.trackerClan.reviewJoin({
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
      const result = await this._useCases.trackerClan.updateMemberRole({
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
      const result = await this._useCases.trackerClan.removeMember({
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
      const result = await this._useCases.trackerClan.leaveClan({
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
      const result = await this._useCases.trackerClan.transferOwnership({
        trackerId: req.params.trackerId,
        newOwnerId: req.body.newOwnerId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Ownership invitation sent', result));
    } catch (error) {
      next(error);
    }
  };

  respondToRoleInvitation = async (
    req: Request<ClanRoleInvitationParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.trackerClan.respondToRoleInvitation({
        trackerId: req.params.trackerId,
        invitationId: req.params.invitationId,
        userId: getAuthUser(req).userId,
        action: req.body.action,
      });
      res.json(
        new ApiResponse(
          req.body.action === 'accept' ? 'Role invitation accepted' : 'Role invitation declined',
          result
        )
      );
    } catch (error) {
      next(error);
    }
  };

  syncPersonalClone = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.trackerClan.syncPersonalClone({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });
      res.json(
        new ApiResponse('Latest guild changes fetched without removing personal topics', result)
      );
    } catch (error) {
      next(error);
    }
  };

  listMessages = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const query = res.locals.clanMessagesQuery as { limit: number };
      const result = await this._useCases.trackerClan.listMessages({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        limit: query.limit,
      });
      res.json(new ApiResponse('Guild chat history fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };
}
