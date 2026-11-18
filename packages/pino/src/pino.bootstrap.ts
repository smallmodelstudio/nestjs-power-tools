import type { INestApplicationContext } from '@nestjs/common';
import type { LoggerOptions } from 'pino';
import { PinoLogger } from './pino-logger.service.js';
import { createPino } from './pino.options.js';

/** Creates a standalone `PinoLogger`, e.g. for `NestFactory.create(AppModule, { logger })`. */
export function createPinoLogger(options?: LoggerOptions): PinoLogger {
  return new PinoLogger(createPino(options));
}

/**
 * Replaces the app logger with pino. Pair with
 * `NestFactory.create(AppModule, { bufferLogs: true })` so startup logs are
 * not lost.
 */
export function usePinoLogger(app: INestApplicationContext, options?: LoggerOptions): PinoLogger {
  const logger = createPinoLogger(options);
  app.useLogger(logger);
  return logger;
}
