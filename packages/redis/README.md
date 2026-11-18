# @nestjs-power-tools/redis

Helpers for the [NestJS Redis transport](https://docs.nestjs.com/microservices/redis): server options, a client module and bootstrap functions.

## Install

```bash
pnpm add @nestjs-power-tools/redis @nestjs/microservices ioredis
```

Peers: `@nestjs/common`, `@nestjs/core`, `@nestjs/microservices` (>=11), `ioredis` (>=5).

## Quick start

**Server** (`main.ts`)

```ts
import { createRedisMicroservice, redisOptionsFromEnv } from '@nestjs-power-tools/redis';

const app = await createRedisMicroservice(AppModule, redisOptionsFromEnv());
await app.listen();
```

**Hybrid app** (HTTP + Redis)

```ts
import { connectRedisMicroservice } from '@nestjs-power-tools/redis';

const app = await NestFactory.create(AppModule);
connectRedisMicroservice(app, { host: 'redis' });
await app.startAllMicroservices();
await app.listen(3000);
```

**Client**

```ts
@Module({
  imports: [RedisClientModule.register({ name: 'REDIS', options: { host: 'redis' } })],
})
export class AppModule {}

@Injectable()
export class AppService {
  constructor(@InjectRedisClient('REDIS') private readonly client: ClientProxy) {}
}
```

Use `RedisClientModule.registerAsync({ name, useFactory, inject, imports })` to build options from `ConfigService`.

## API

| Export                                   | What it does                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `createRedisOptions(options?)`           | Returns `{ transport: Transport.REDIS, options }`, defaulting to `localhost:6379`. |
| `redisOptionsFromEnv(env?)`              | Reads `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`.                    |
| `RedisClientModule.register/Async`       | `ClientsModule` pre-set to the Redis transport. Accepts `isGlobal`.                |
| `createRedisMicroservice(module, opts?)` | Wraps `NestFactory.createMicroservice`.                                            |
| `connectRedisMicroservice(app, opts?)`   | Wraps `app.connectMicroservice` with `inheritAppConfig: true`.                     |
| `InjectRedisClient(name)`                | Shorthand for `@Inject(name)`.                                                     |
