import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiResponse } from '../../../../shared/utils/api-response';
import type { ModerationAppealUseCases } from '../application/moderation-appeal-use-cases.contract';

export class ModerationAppealController {
  constructor(private readonly _useCases: ModerationAppealUseCases) {}

  submitAppeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = res.locals.appealAuthorization as {
        userId: string;
        identifier: string;
      };
      const payload = { ...req.body, ...authorization };
      const result = await this._useCases.submitModerationAppeal.execute(payload);

      res
        .status(HttpStatusCode.CREATED)
        .json(
          new ApiResponse('Appeal submitted successfully. Our team will review it shortly.', result)
        );
    } catch (error) {
      next(error);
    }
  };

  getAppealStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = res.locals.appealAuthorization as {
        userId: string;
        identifier: string;
      };
      const payload = { ...req.body, ...authorization };
      const result = await this._useCases.getActiveModerationAppealStatus.execute(payload);

      res.json(new ApiResponse('Active appeal fetched', result));
    } catch (error) {
      next(error);
    }
  };

  listContentAppeals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.contentAppeals.list(String(req.user?.userId));
      res.json(new ApiResponse('Content appeals fetched', result));
    } catch (error) {
      next(error);
    }
  };

  submitContentAppeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.contentAppeals.submit({
        userId: String(req.user?.userId),
        ...req.body,
      });
      res.status(HttpStatusCode.CREATED).json(new ApiResponse('Content appeal submitted', result));
    } catch (error) {
      next(error);
    }
  };
}
