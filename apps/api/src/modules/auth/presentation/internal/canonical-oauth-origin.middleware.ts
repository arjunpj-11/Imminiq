import type { Request, RequestHandler } from 'express';

import { env } from '../../../../config/env';

const clientHost = new URL(env.CLIENT_URL).host.toLowerCase();
const apiOrigin = new URL(env.SERVER_URL).origin;
const apiHost = new URL(apiOrigin).host.toLowerCase();

const forwardedHosts = (req: Request): string[] => {
  const forwarded = req.get('x-forwarded-host') ?? '';

  return forwarded
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
};

const arrivedThroughClientProxy = (req: Request): boolean => {
  if (clientHost === apiHost) return false;

  const publicHosts = forwardedHosts(req);
  if (publicHosts.length > 0) {
    return publicHosts[0] === clientHost;
  }

  return (req.get('host') ?? '').toLowerCase() === clientHost;
};

/**
 * OAuth state cookies are host-only. A request rewritten by the frontend proxy must first
 * become a browser-visible navigation to the API origin so the callback receives that cookie.
 */
export const useCanonicalOAuthOrigin: RequestHandler = (req, res, next) => {
  if (!arrivedThroughClientProxy(req)) {
    next();
    return;
  }

  const target = new URL(apiOrigin);
  target.pathname = req.originalUrl.split('?')[0];
  res.redirect(target.toString());
};
