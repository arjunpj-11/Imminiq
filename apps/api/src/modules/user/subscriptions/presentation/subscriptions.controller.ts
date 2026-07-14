import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import type { SubscriptionsUseCases } from '../application/subscriptions-use-cases.contract';
import { subscriptionOrderSchema, subscriptionVerificationSchema } from './subscriptions.schema';

export class SubscriptionsController {
  constructor(private readonly useCases: SubscriptionsUseCases) {}

  listPlans = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(new ApiResponse('Subscription plans fetched', await this.useCases.listPlans.execute()));
    } catch (error) {
      next(error);
    }
  };

  getMine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        new ApiResponse(
          'Current subscription fetched',
          await this.useCases.getCurrent.execute(req.user!.userId)
        )
      );
    } catch (error) {
      next(error);
    }
  };

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = subscriptionOrderSchema.parse(req.body);
      res.json(
        new ApiResponse(
          'Subscription order created',
          await this.useCases.createOrder.execute(req.user!.userId, input.planId, input.billingCycle)
        )
      );
    } catch (error) {
      next(error);
    }
  };

  verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = subscriptionVerificationSchema.parse(req.body);
      res.json(
        new ApiResponse(
          'Payment verified and premium activated',
          await this.useCases.verifyPayment.execute({ userId: req.user!.userId, ...input })
        )
      );
    } catch (error) {
      next(error);
    }
  };
}
