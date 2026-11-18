/** HTTP methods retried by default: the idempotent ones. */
export const HTTP_DEFAULT_RETRY_METHODS = ['get', 'head', 'options', 'put', 'delete'];

/** Status codes retried by default. */
export const HTTP_DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504];
