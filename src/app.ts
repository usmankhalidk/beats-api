import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import hpp from 'hpp';
import { config } from '@config/index';
import { sanitize } from '@middleware/sanitize';
import { globalRateLimiter } from '@middleware/rate-limit';
import { errorHandler } from '@middleware/error-handler';
import { notFoundHandler } from '@middleware/not-found';
import { mountSwagger } from '@shared/swagger';
import apiRouter from '@modules/index';
import webhookRouter from '@modules/payments/webhook-routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  }));
  app.use(
    cors({
      origin: config.cors.origins.length === 1 && config.cors.origins[0] === '*' ? true : config.cors.origins,
      credentials: true,
    }),
  );
  app.use(compression());

  // Webhooks must see the raw bytes the gateway signed, so they are mounted with
  // express.raw() BEFORE the global express.json() parser below.
  app.use('/api/v1/webhooks', express.raw({ type: '*/*', limit: '1mb' }), webhookRouter);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(hpp());
  app.use(sanitize);

  if (!config.isTest) {
    app.use(morgan(config.isProduction ? 'combined' : 'dev'));
  }

  app.use(globalRateLimiter);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ success: true, code: 200, message: 'OK', data: { status: 'healthy', env: config.env, version:'v2' } });
  });

  mountSwagger(app);

  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
