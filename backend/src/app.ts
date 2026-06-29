import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import routes from './routes';
import assetRoutes from './routes/asset.routes';
import { notFoundHandler, errorHandler } from './middleware/error';
import { globalLimiter } from './middleware/rateLimit';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  // Security & infrastructure middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (!env.isProd) app.use(morgan('dev'));

  // Runtime uploads (ignored by git) — legacy local upload bucket.
  app.use('/uploads', express.static(path.resolve(process.cwd(), env.upload.dir)));

  // Product assets — public, read-only, served via the storage provider.
  // Mounted before the rate limiter so images don't burn the API quota.
  app.use(`${env.apiPrefix}/assets`, assetRoutes);

  // Rate limiting + API routes
  app.use(env.apiPrefix, globalLimiter, routes);

  // Fallbacks
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
