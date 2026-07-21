import type { NextFunction, Request, Response } from 'express';

import { sendAdminResult } from '../../../../shared/admin';
import type { AdminAITokenSpendUseCases } from '../application/admin-ai-token-spend-use-cases.contract';
import { adminAITokenSpendQuerySchema } from './admin-ai-token-spend.schema';

const DAY_IN_MILLISECONDS = 86_400_000;

export class AdminAITokenSpendController {
  constructor(private readonly _useCases: AdminAITokenSpendUseCases) {}

  get = (req: Request, res: Response, next: NextFunction) => {
    const input = adminAITokenSpendQuerySchema.parse(req.query);
    const to = input.to ? new Date(`${input.to}T23:59:59.999Z`) : new Date();
    const from = input.from
      ? new Date(`${input.from}T00:00:00.000Z`)
      : new Date(to.getTime() - (input.days - 1) * DAY_IN_MILLISECONDS);
    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / DAY_IN_MILLISECONDS));

    return sendAdminResult(
      next,
      () => this._useCases.get.execute({ from, to, days }),
      res,
      'AI token spend fetched'
    );
  };
}
