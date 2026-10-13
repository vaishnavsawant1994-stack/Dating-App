import { trace, type Tracer } from '@opentelemetry/api';

export function getTracer(serviceName: string): Tracer {
  return trace.getTracer(serviceName);
}
