import { ParseUUIDPipe as NestParseUUIDPipe, type ParseUUIDPipeOptions } from '@nestjs/common';

/** Nest's `ParseUUIDPipe`, defaulting to UUID v4 so `@Param('id', ParseUUID)` just works. */
export class ParseUUIDPipe extends NestParseUUIDPipe {
  constructor(options: ParseUUIDPipeOptions = {}) {
    super({ version: '4', ...options });
  }
}
