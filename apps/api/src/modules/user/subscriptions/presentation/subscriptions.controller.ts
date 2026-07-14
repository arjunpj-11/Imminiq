import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import type { ISubscriptionsUseCase } from '../application/subscriptions.usecase';
import { subscriptionOrderSchema, subscriptionVerificationSchema } from './subscriptions.schema';

export class SubscriptionsController {
  constructor(private readonly useCase: ISubscriptionsUseCase) {}

  listPlans = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(new ApiResponse('Subscription plans fetched', await this.useCase.listPlans()));
    } catch (error) {
      next(error);
    }
  };

  getMine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        new ApiResponse('Current subscription fetched', await this.useCase.getMine(req.user!.userId))
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
          await this.useCase.createOrder(req.user!.userId, input.planId, input.billingCycle)
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
          await this.useCase.verifyPayment({ userId: req.user!.userId, ...input })
        )
      );
    } catch (error) {
      next(error);
    }
  };
}
