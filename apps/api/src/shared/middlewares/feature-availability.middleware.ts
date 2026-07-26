import type { NextFunction, Request, Response } from 'express';

import type { FeaturePolicy, IFeaturePolicyReader } from '../platform-policy';
import { ApiError } from '../utils/api-error';

export const createRequireEnabledFeature = (
  reader: IFeaturePolicyReader,
  feature: keyof FeaturePolicy,
  label: string
) => {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      const enabled = (await reader.getFeaturePolicy())[feature];

      if (!enabled) {
        throw new ApiError(
          503,
          `${label} is temporarily unavailable while the platform team completes maintenance.`,
          'FEATURE_TEMPORARILY_UNAVAILABLE'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
