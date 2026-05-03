import { createApp } from './app';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { prisma } from '@utils/prisma-client';

async function bootstrap(): Promise<void> {
  const app = createApp();

  const server = app.listen(config.app.port, () => {
    logger.info('server.started', {
      env: config.env,
      port: config.app.port,
      url: config.app.url,
      docs: `${config.app.url}/api-docs`,
    });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info('server.shutdown', { signal });
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    logger.error('unhandledRejection', { reason: reason instanceof Error ? reason.message : String(reason) });
  });
  process.on('uncaughtException', (err) => {
    logger.error('uncaughtException', { message: err.message, stack: err.stack });
    void shutdown('uncaughtException');
  });
}

void bootstrap();
