import { HttpService } from '@nestjs/axios';
import type {
  DynamicModule,
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
} from '@nestjs/common';
import axios, { type CreateAxiosDefaults } from 'axios';
import { attachRetry, type HttpRetryOptions } from './http.retry.js';

export interface HttpClientOptions extends CreateAxiosDefaults {
  /** Retry behaviour. Omit (or pass `false`) to disable retries. */
  retry?: HttpRetryOptions | false;
}

export interface HttpClientModuleOptions {
  options?: HttpClientOptions;
  isGlobal?: boolean;
}

export interface HttpClientModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => HttpClientOptions | Promise<HttpClientOptions>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  isGlobal?: boolean;
}

export function createHttpService({ retry, ...axiosConfig }: HttpClientOptions = {}): HttpService {
  const instance = axios.create(axiosConfig);
  if (retry) attachRetry(instance, retry);
  return new HttpService(instance);
}

/** Provides `HttpService` (from `@nestjs/axios`) with optional retry/backoff built in. */
export class HttpClientModule {
  static register({ options, isGlobal }: HttpClientModuleOptions = {}): DynamicModule {
    return {
      module: HttpClientModule,
      global: isGlobal,
      providers: [{ provide: HttpService, useFactory: () => createHttpService(options) }],
      exports: [HttpService],
    };
  }

  static registerAsync({
    useFactory,
    inject,
    imports,
    isGlobal,
  }: HttpClientModuleAsyncOptions): DynamicModule {
    return {
      module: HttpClientModule,
      global: isGlobal,
      imports,
      providers: [
        {
          provide: HttpService,
          useFactory: async (...args: any[]) => createHttpService(await useFactory(...args)),
          inject,
        },
      ],
      exports: [HttpService],
    };
  }
}
