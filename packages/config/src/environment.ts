import { z } from 'zod';

export const runtimeEnvironments = [
  'local',
  'test',
  'preview',
  'staging',
  'sandbox',
  'production',
] as const;

export const RuntimeEnvironmentSchema = z.enum(runtimeEnvironments);
export type RuntimeEnvironment = z.infer<typeof RuntimeEnvironmentSchema>;

export function isDeployedEnvironment(environment: RuntimeEnvironment): boolean {
  return environment === 'staging' || environment === 'sandbox' || environment === 'production';
}

export function isProduction(environment: RuntimeEnvironment): boolean {
  return environment === 'production';
}
