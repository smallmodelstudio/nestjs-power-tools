import type { InterceptorOptions } from '../../utils/index.js';

export interface TimeoutInterceptorOptions extends InterceptorOptions {
  /**
   * The default timeout of the interceptor, in milliseconds.
   */
  timeout?: number;
}
