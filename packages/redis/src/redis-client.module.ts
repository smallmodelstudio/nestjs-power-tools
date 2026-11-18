import type {
  DynamicModule,
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
} from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { createRedisOptions, type RedisTransportOptions } from './redis.options.js';

export interface RedisClientRegisterOptions {
  /** Injection token for the client, used with `@Inject(name)` / `@InjectRedisClient(name)`. */
  name: string | symbol;
  options?: RedisTransportOptions;
  /** Register the client globally. Defaults to false. */
  isGlobal?: boolean;
}

export interface RedisClientRegisterAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name: string | symbol;
  useFactory: (...args: any[]) => RedisTransportOptions | Promise<RedisTransportOptions>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  isGlobal?: boolean;
}

/** Thin wrapper over `ClientsModule` pre-configured for the Redis transport. */
export class RedisClientModule {
  static register({ name, options, isGlobal }: RedisClientRegisterOptions): DynamicModule {
    return ClientsModule.register({
      isGlobal,
      clients: [{ name, ...createRedisOptions(options) }],
    });
  }

  static registerAsync({
    name,
    useFactory,
    inject,
    imports,
    isGlobal,
  }: RedisClientRegisterAsyncOptions): DynamicModule {
    return ClientsModule.registerAsync({
      isGlobal,
      clients: [
        {
          name,
          imports,
          inject,
          useFactory: async (...args: any[]) => createRedisOptions(await useFactory(...args)),
        },
      ],
    });
  }
}
