import type { LogLevel, LoggerService } from '@nestjs/common';
import type { Logger } from 'pino';
import { createPino } from './pino.options.js';

type PinoMethod = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LEVEL_MAP: Record<LogLevel, PinoMethod> = {
  verbose: 'trace',
  debug: 'debug',
  log: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'fatal',
};

/**
 * Nest `LoggerService` backed by pino. Nest passes the context as the last
 * string argument; it is emitted as the `context` field.
 */
export class PinoLogger implements LoggerService {
  constructor(
    readonly logger: Logger = createPino(),
    private defaultContext?: string,
  ) {}

  /** A logger whose entries carry the given context. */
  child(context: string): PinoLogger {
    return new PinoLogger(this.logger, context);
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    this.write('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    this.write('fatal', message, optionalParams);
  }

  /** Sets pino's level to the most verbose of the given Nest log levels. */
  setLogLevels(levels: LogLevel[]) {
    const values = this.logger.levels.values;
    const lowest = levels
      .map((level) => LEVEL_MAP[level])
      .sort((a, b) => (values[a] ?? 0) - (values[b] ?? 0))[0];
    this.logger.level = lowest ?? 'silent';
  }

  private write(level: LogLevel, message: unknown, params: unknown[]) {
    let context = this.defaultContext;
    let stack: string | undefined;
    const rest = [...params];

    // Nest convention: the last string param is the context; for `error`,
    // a preceding string is the stack trace.
    if (typeof rest.at(-1) === 'string') context = rest.pop() as string;
    if (level === 'error' && typeof rest.at(-1) === 'string') stack = rest.pop() as string;

    const bindings: Record<string, unknown> = {};
    if (context) bindings['context'] = context;
    if (stack) bindings['stack'] = stack;
    if (rest.length) bindings['params'] = rest;

    const method = LEVEL_MAP[level];
    if (message instanceof Error) {
      this.logger[method]({ ...bindings, err: message }, message.message);
    } else if (message !== null && typeof message === 'object') {
      this.logger[method]({ ...bindings, ...message });
    } else {
      this.logger[method](bindings, String(message));
    }
  }
}
