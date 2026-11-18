import {
  isAxiosError,
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { HTTP_DEFAULT_RETRY_METHODS, HTTP_DEFAULT_RETRY_STATUSES } from './http.constants.js';

export interface HttpRetryOptions {
  /** Retries after the first attempt. Defaults to 3. */
  retries?: number;
  /** Base delay in ms for exponential backoff (`delay * 2^attempt`). Defaults to 200. 0 disables waiting. */
  delay?: number;
  /** Upper bound for a single delay in ms. Defaults to 5000. */
  maxDelay?: number;
  /** Lower-case HTTP methods eligible for retry. Defaults to idempotent methods. */
  methods?: string[];
  /** Response statuses eligible for retry. Network errors are always eligible. */
  statuses?: number[];
  /** Full override of the retry decision. Receives the error and the retry attempt (1-based). */
  shouldRetry?: (error: AxiosError, attempt: number) => boolean;
  /** Called before each retry, e.g. for logging. */
  onRetry?: (error: AxiosError, attempt: number, delayMs: number) => void;
}

const RETRY_COUNT = Symbol('retryCount');
type RetryConfig = InternalAxiosRequestConfig & { [RETRY_COUNT]?: number };

export function defaultShouldRetry(error: AxiosError, options: HttpRetryOptions): boolean {
  const method = (error.config?.method ?? 'get').toLowerCase();
  if (!(options.methods ?? HTTP_DEFAULT_RETRY_METHODS).includes(method)) return false;
  if (error.code === 'ERR_CANCELED') return false;
  // No response: network failure or timeout.
  if (!error.response) return true;
  return (options.statuses ?? HTTP_DEFAULT_RETRY_STATUSES).includes(error.response.status);
}

export function backoffDelay(attempt: number, { delay = 200, maxDelay = 5000 }: HttpRetryOptions) {
  return Math.min(delay * 2 ** (attempt - 1), maxDelay);
}

/** Installs a retrying response interceptor on an axios instance. */
export function attachRetry(
  instance: AxiosInstance,
  options: HttpRetryOptions = {},
): AxiosInstance {
  const retries = options.retries ?? 3;

  instance.interceptors.response.use(undefined, async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) throw error;

    const config = error.config as RetryConfig;
    const attempt = (config[RETRY_COUNT] ?? 0) + 1;
    const retry = options.shouldRetry
      ? options.shouldRetry(error, attempt)
      : defaultShouldRetry(error, options);
    if (attempt > retries || !retry) throw error;

    const wait = backoffDelay(attempt, options);
    options.onRetry?.(error, attempt, wait);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));

    config[RETRY_COUNT] = attempt;
    return instance.request(config);
  });

  return instance;
}
