import { randomBytes } from 'node:crypto';
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
const w3cTraceParentPattern = /^[0-9a-f]{2}-([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}$/i;

export function createTraceId(): string {
  return randomBytes(16).toString('hex');
}

export function traceIdFromTraceParent(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const match = w3cTraceParentPattern.exec(value.trim());
  const traceId = match?.[1]?.toLowerCase();
  if (traceId === undefined || /^0{32}$/.test(traceId)) {
    return undefined;
  }
  return traceId;
}

export function runWithRequestContext<TResult>(
  context: RequestContext,
  callback: () => TResult,
): TResult {
  return requestContextStorage.run(context, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}
