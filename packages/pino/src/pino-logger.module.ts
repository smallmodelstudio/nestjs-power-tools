import type { DynamicModule } from '@nestjs/common';
import type { LoggerOptions } from 'pino';
import { PINO_INSTANCE } from './pino.constants.js';
import { PinoLogger } from './pino-logger.service.js';
import { createPino } from './pino.options.js';

export interface PinoLoggerModuleOptions {
  options?: LoggerOptions;
  /** Defaults to true so `PinoLogger` is injectable everywhere. */
  isGlobal?: boolean;
}

/** Provides `PinoLogger` (and the raw pino instance under `PINO_INSTANCE`). */
export class PinoLoggerModule {
  static forRoot({ options, isGlobal = true }: PinoLoggerModuleOptions = {}): DynamicModule {
    return {
      module: PinoLoggerModule,
      global: isGlobal,
      providers: [
        { provide: PINO_INSTANCE, useFactory: () => createPino(options) },
        {
          provide: PinoLogger,
          useFactory: (pino: ReturnType<typeof createPino>) => new PinoLogger(pino),
          inject: [PINO_INSTANCE],
        },
      ],
      exports: [PINO_INSTANCE, PinoLogger],
    };
  }
}
