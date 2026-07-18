import type { Request, RequestHandler } from 'express';

import { env } from '../../../../config/env';

const apiOrigin = new URL(env.SERVER_URL).origin;
const apiHost = new URL(apiOrigin).host.toLowerCase();

const forwardedHosts = (req: Request): string[] => {
  const forwarded = req.get('x-forwarded-host') ?? '';

  return forwarded
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
};

const browserVisibleHost = (req: Request): string => {
  const publicHosts = forwardedHosts(req);
  if (publicHosts.length > 0) {
    return publicHosts[0];
  }

  return (req.get('host') ?? '').toLowerCase();
};

/**
 * OAuth state cookies are host-only. A request rewritten by the frontend proxy must first
 * become a browser-visible navigation to the API origin so the callback receives that cookie.
 */
export const useCanonicalOAuthOrigin: RequestHandler = (req, res, next) => {
  if (browserVisibleHost(req) === apiHost) {
    next();
    return;
  }

  const target = new URL(req.originalUrl, apiOrigin);
  res.redirect(target.toString());
};
