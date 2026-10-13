import { type AdminEnvironment } from './access';

const allowed = new Set<AdminEnvironment>([
  'local',
  'test',
  'preview',
  'staging',
  'sandbox',
  'production',
]);

export function adminEnvironment(source: string | undefined = process.env.APP_ENV): AdminEnvironment {
  const value = source ?? 'local';
  if (!allowed.has(value as AdminEnvironment)) {
    throw new Error(`Unsupported Admin environment: ${value}`);
  }
  return value as AdminEnvironment;
}
