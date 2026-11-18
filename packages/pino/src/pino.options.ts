import pino, { type Logger, type LoggerOptions } from 'pino';
import { PINO_DEFAULT_LEVEL } from './pino.constants.js';

/** Creates a pino instance, defaulting the level to `info`. */
export function createPino(options: LoggerOptions = {}): Logger {
  return pino({ level: PINO_DEFAULT_LEVEL, ...options });
}

/** Reads pino options from environment variables (`LOG_LEVEL`). */
export function pinoOptionsFromEnv(
  env: Record<string, string | undefined> = process.env,
): LoggerOptions {
  return env['LOG_LEVEL'] ? { level: env['LOG_LEVEL'] } : {};
}
