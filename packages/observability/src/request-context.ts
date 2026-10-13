import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  readonly requestId: string;
  readonly traceId?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly identityId?: string;
  readonly client?: string;
  readonly clientVersion?: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<TResult>(
  context: RequestContext,
  callback: () => TResult,
): TResult {
  return requestContextStorage.run(context, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}
