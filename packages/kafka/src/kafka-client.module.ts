import type {
  DynamicModule,
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
} from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { createKafkaOptions, type KafkaTransportOptions } from './kafka.options.js';

export interface KafkaClientRegisterOptions {
  /** Injection token for the client, used with `@Inject(name)` / `@InjectKafkaClient(name)`. */
  name: string | symbol;
  options?: KafkaTransportOptions;
  /** Register the client globally. Defaults to false. */
  isGlobal?: boolean;
}

export interface KafkaClientRegisterAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name: string | symbol;
  useFactory: (...args: any[]) => KafkaTransportOptions | Promise<KafkaTransportOptions>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  isGlobal?: boolean;
}

/** Thin wrapper over `ClientsModule` pre-configured for the Kafka transport. */
export class KafkaClientModule {
  static register({ name, options, isGlobal }: KafkaClientRegisterOptions): DynamicModule {
    return ClientsModule.register({
      isGlobal,
      clients: [{ name, ...createKafkaOptions(options) }],
    });
  }

  static registerAsync({
    name,
    useFactory,
    inject,
    imports,
    isGlobal,
  }: KafkaClientRegisterAsyncOptions): DynamicModule {
    return ClientsModule.registerAsync({
      isGlobal,
      clients: [
        {
          name,
          imports,
          inject,
          useFactory: async (...args: any[]) => createKafkaOptions(await useFactory(...args)),
        },
      ],
    });
  }
}
