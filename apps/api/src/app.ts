import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';

import { env } from './config/env';
import { redis } from './config/redis';
import { initPassport } from './infrastructure/auth/passport';
import { createApiRouter } from './routes/api.router';
import { API_ROUTE_PATHS } from './shared/constants/api-route-paths';
import { apiNotFoundHandler, errorHandler } from './shared/middlewares/errorHandler';
import { verifyBrowserRequestOrigin } from './shared/middlewares/request-origin.middleware';
import { validateCsrfToken } from './shared/middlewares/csrf-token.middleware';
import { ApiError } from './shared/utils/ApiError';

const app = express();
const { router: apiRouter, authRepository } = createApiRouter();

app.disable('x-powered-by');
if (env.NODE_ENV === 'production') {
  // Render terminates TLS at one reverse proxy. Trusting exactly one hop keeps
  // rate limits and audit IPs accurate without accepting spoofed forwarded IPs.
  app.set('trust proxy', 1);
}

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new ApiError(
        429,
        'Too many requests. Please wait a moment and try again.',
        'GLOBAL_RATE_LIMITED'
      )
    );
  },
});

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(
  env.NODE_ENV === 'production'
    ? morgan((tokens, req, res) =>
        JSON.stringify({
          level: 'info',
          event: 'http_request',
          method: tokens.method(req, res),
          // Query strings may contain OAuth codes or one-time tokens. They
          // must never enter production logs.
          path: tokens.url(req, res)?.split('?')[0],
          status: Number(tokens.status(req, res) ?? 0),
          responseTimeMs: Number(tokens['response-time'](req, res) ?? 0),
          contentLength: Number(tokens.res(req, res, 'content-length') ?? 0),
          remoteAddress: tokens['remote-addr'](req, res),
          userAgent: tokens.req(req, res, 'user-agent'),
        })
      )
    : morgan('dev')
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb', parameterLimit: 1_000 }));
app.use(cookieParser());

app.use(globalApiLimiter);
app.use(verifyBrowserRequestOrigin);
app.use(validateCsrfToken);

initPassport(authRepository);
app.use(passport.initialize());

app.get(API_ROUTE_PATHS.healthLive, (_req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) });
});

app.get(API_ROUTE_PATHS.healthReady, async (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  let redisReady: boolean;

  try {
    redisReady = (await redis.ping()) === 'PONG';
  } catch {
    redisReady = false;
  }

  const ready = mongoReady && redisReady;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    dependencies: { mongo: mongoReady, redis: redisReady },
  });
});

app.get(API_ROUTE_PATHS.health, (_req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) });
});

app.use(apiRouter);
app.use(apiNotFoundHandler);
app.use(errorHandler);

export default app;
