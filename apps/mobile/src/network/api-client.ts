import { MobileApiError } from './api-error';

const safeRetryMethods = new Set(['GET', 'HEAD']);

export interface MobileApiClientOptions {
  readonly baseUrl: string;
  readonly platform: 'ios' | 'android';
  readonly clientVersion: string;
  readonly fetchImpl?: typeof fetch;
  readonly requestIdFactory: () => string;
  readonly timeoutMs?: number;
}

export interface MobileRequestOptions {
  readonly method?: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: string;
  readonly signal?: AbortSignal;
}

function normalizedMethod(method: string | undefined): string {
  return (method ?? 'GET').toUpperCase();
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function responseError(response: Response): Promise<MobileApiError> {
  const requestId = response.headers.get('x-request-id') ?? undefined;
  try {
    const body = (await response.json()) as {
      error?: { code?: unknown; message?: unknown; retryable?: unknown; request_id?: unknown };
    };
    if (
      typeof body.error?.code === 'string' &&
      typeof body.error.message === 'string' &&
      typeof body.error.retryable === 'boolean'
    ) {
      return new MobileApiError({
        code: body.error.code,
        message: body.error.message,
        retryable: body.error.retryable,
        status: response.status,
        requestId:
          typeof body.error.request_id === 'string' ? body.error.request_id : requestId,
      });
    }
  } catch {
    // Fall through to a sanitized transport error.
  }
  return new MobileApiError({
    code: 'HTTP_ERROR',
    message: 'The service returned an unexpected response.',
    retryable: isRetryableStatus(response.status),
    status: response.status,
    requestId,
  });
}

export function createMobileApiClient(options: MobileApiClientOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10_000;

  return {
    async request(path: string, requestOptions: MobileRequestOptions = {}): Promise<Response> {
      if (!path.startsWith('/')) {
        throw new MobileApiError({
          code: 'INVALID_PATH',
          message: 'API paths must begin with /.',
          retryable: false,
        });
      }

      const method = normalizedMethod(requestOptions.method);
      const safeToRetry = safeRetryMethods.has(method);
      const maxAttempts = safeToRetry ? 2 : 1;
      let lastFailure: MobileApiError | undefined;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const controller = new AbortController();
        const onAbort = () => controller.abort(requestOptions.signal?.reason);
        requestOptions.signal?.addEventListener('abort', onAbort, { once: true });
        const timeout = setTimeout(() => controller.abort('timeout'), timeoutMs);

        try {
          const response = await fetchImpl(`${options.baseUrl}${path}`, {
            method,
            body: requestOptions.body,
            signal: controller.signal,
            headers: {
              accept: 'application/json',
              'x-request-id': options.requestIdFactory(),
              'x-client-version': options.clientVersion,
              'x-platform': options.platform,
              ...requestOptions.headers,
            },
          });

          if (response.ok) {
            return response;
          }

          const error = await responseError(response);
          lastFailure = error;
          if (!safeToRetry || !error.retryable || attempt === maxAttempts) {
            throw error;
          }
        } catch (error) {
          if (error instanceof MobileApiError) {
            if (!safeToRetry || !error.retryable || attempt === maxAttempts) {
              throw error;
            }
            lastFailure = error;
          } else {
            const timedOut = controller.signal.aborted && requestOptions.signal?.aborted !== true;
            const transport = new MobileApiError({
              code: timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
              message: timedOut ? 'The request timed out.' : 'The service could not be reached.',
              retryable: safeToRetry,
            });
            lastFailure = transport;
            if (!safeToRetry || attempt === maxAttempts) {
              throw transport;
            }
          }
        } finally {
          clearTimeout(timeout);
          requestOptions.signal?.removeEventListener('abort', onAbort);
        }
      }

      throw lastFailure ?? new MobileApiError({ code: 'NETWORK_ERROR', message: 'Request failed.', retryable: false });
    },
  };
}
