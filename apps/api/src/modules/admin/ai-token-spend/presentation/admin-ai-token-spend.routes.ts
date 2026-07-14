import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { requireAdmin } from '../../../../shared/middlewares/admin.middleware';
import { sendAdminResult } from '../../shared';
import type { GetAdminAITokenSpendUseCase } from '../application/get-admin-ai-token-spend.usecase';

const querySchema = z
  .object({
    days: z.coerce.number().int().min(1).max(365).default(30),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
  })
  .refine((input) => !input.from || !input.to || input.from <= input.to, {
    message: 'The start date must be on or before the end date',
    path: ['to'],
  });

export const createAdminAITokenSpendRoutes = (useCase: GetAdminAITokenSpendUseCase) => {
  const router = Router();
  router.use(authenticate, requireAdmin);
  router.get('/', (req: Request, res: Response, next: NextFunction) => {
    const input = querySchema.parse(req.query);
    const to = input.to ? new Date(`${input.to}T23:59:59.999Z`) : new Date();
    const from = input.from
      ? new Date(`${input.from}T00:00:00.000Z`)
      : new Date(to.getTime() - (input.days - 1) * 86400000);
    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));
    return sendAdminResult(
      next,
      () => useCase.execute({ from, to, days }),
      res,
      'AI token spend fetched'
    );
  });
  return router;
};
