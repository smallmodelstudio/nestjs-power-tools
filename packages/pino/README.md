# @nestjs-power-tools/pino

A [pino](https://getpino.io)-backed implementation of the [NestJS `LoggerService`](https://docs.nestjs.com/application/logger).

## Install

```bash
pnpm add @nestjs-power-tools/pino pino
```

Peers: `@nestjs/common` (>=11), `pino` (>=9). Output is JSON; add `pino-pretty` yourself for dev formatting.

## Quick start

**Replace the app logger** (`main.ts`)

```ts
import { usePinoLogger } from '@nestjs-power-tools/pino';

const app = await NestFactory.create(AppModule, { bufferLogs: true });
usePinoLogger(app, { level: 'debug' });
await app.listen(3000);
```

`bufferLogs: true` holds startup logs until the pino logger is attached.

**Inject it**

```ts
@Module({ imports: [PinoLoggerModule.forRoot({ options: { level: 'info' } })] })
export class AppModule {}

@Injectable()
export class UsersService {
  private readonly logger: PinoLogger;
  constructor(logger: PinoLogger) {
    this.logger = logger.child(UsersService.name);
  }
}
```

The module is global by default. The raw pino instance is available under the `PINO_INSTANCE` token.

## API

| Export                                            | What it does                                                                                                      |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `PinoLogger`                                      | `LoggerService` over pino: `log`, `error`, `warn`, `debug`, `verbose`, `fatal`, `setLogLevels`, `child(context)`. |
| `PinoLoggerModule.forRoot({ options, isGlobal })` | Provides `PinoLogger` and `PINO_INSTANCE`.                                                                        |
| `usePinoLogger(app, options?)`                    | Calls `app.useLogger(...)` and returns the logger.                                                                |
| `createPinoLogger(options?)`                      | Standalone `PinoLogger`, e.g. `NestFactory.create(M, { logger })`.                                                |
| `createPino(options?)`                            | Plain pino instance, level defaults to `info`.                                                                    |
| `pinoOptionsFromEnv(env?)`                        | Reads `LOG_LEVEL`.                                                                                                |

## Good to know

- Level mapping: `log` → `info`, `verbose` → `trace`; the rest match by name.
- Nest's trailing string argument is written as `context`. For `error(msg, stack, context)` the middle string is written as `stack`.
- `Error` objects are logged as `err`; object messages are merged into the log line.
- This is a plain `LoggerService`: no HTTP request logging. Use `nestjs-pino` if you need that.
