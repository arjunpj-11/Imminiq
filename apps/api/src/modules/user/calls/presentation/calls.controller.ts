import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiError } from '../../../../shared/utils/api-error';
import { ApiResponse } from '../../../../shared/utils/api-response';
import { getAuthUser } from '../../../../shared/utils/get-auth-user';
import { CALL_RESPONSE_MESSAGES } from '../application/call.constants';
import type { CallsUseCases } from '../application/calls-use-cases.contract';
import {
  callIdParamsSchema,
  endCallSchema,
  initiateCallSchema,
  listCallsSchema,
  respondCallSchema,
} from './calls.schema';

export class CallsController {
  constructor(private readonly _useCases: CallsUseCases) {}

  getActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getActiveCall.execute(getAuthUser(req).userId);
      res.json(new ApiResponse(CALL_RESPONSE_MESSAGES.ACTIVE_LOADED, result));
    } catch (error) {
      next(error);
    }
  };

  getIceServers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getIceServers.execute(getAuthUser(req).userId);
      res.json(new ApiResponse(CALL_RESPONSE_MESSAGES.ICE_SERVERS_LOADED, result));
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = this.parse(listCallsSchema.safeParse(req.query));
      const result = await this._useCases.listCalls.execute(getAuthUser(req).userId, input);
      res.json(new ApiResponse(CALL_RESPONSE_MESSAGES.HISTORY_LOADED, result));
    } catch (error) {
      next(error);
    }
  };

  initiate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = this.parse(initiateCallSchema.safeParse(req.body));
      const result = await this._useCases.initiateCall.execute(getAuthUser(req).userId, input);
      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse(CALL_RESPONSE_MESSAGES.STARTED, result));
    } catch (error) {
      next(error);
    }
  };

  respond = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parse(callIdParamsSchema.safeParse(req.params));
      const input = this.parse(respondCallSchema.safeParse(req.body));
      const result = await this._useCases.respondCall.execute(
        getAuthUser(req).userId,
        params.callId,
        input
      );
      res.json(new ApiResponse(CALL_RESPONSE_MESSAGES.RESPONDED, result));
    } catch (error) {
      next(error);
    }
  };

  end = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parse(callIdParamsSchema.safeParse(req.params));
      const input = this.parse(endCallSchema.safeParse(req.body));
      const result = await this._useCases.endCall.execute(
        getAuthUser(req).userId,
        params.callId,
        input
      );
      res.json(new ApiResponse(CALL_RESPONSE_MESSAGES.ENDED, result));
    } catch (error) {
      next(error);
    }
  };

  private parse<T>(
    result:
      { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } }
  ): T {
    if (result.success) return result.data;
    throw new ApiError(
      HttpStatusCode.BAD_REQUEST,
      result.error.issues[0]?.message ?? 'Call request is invalid',
      'VALIDATION_ERROR'
    );
  }
}
