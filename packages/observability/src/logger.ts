import pino, { type Logger } from 'pino';
import { pinoRedactionPaths, REDACTED_VALUE } from './redaction.js';

export interface LoggerOptions {
  readonly service: string;
  readonly environment: string;
  readonly level?: string;
}

export function createLogger(options: LoggerOptions): Logger {
  return pino({
    level: options.level ?? 'info',
    base: {
      service: options.service,
      environment: options.environment,
    },
    redact: {
      paths: [...pinoRedactionPaths],
      censor: REDACTED_VALUE,
    },
  });
}
