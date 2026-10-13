import { z } from 'zod';
import { RuntimeEnvironmentSchema, type RuntimeEnvironment } from './environment.js';

export const ServiceIdentitySchema = z.object({
  name: z.string().trim().min(1),
  environment: RuntimeEnvironmentSchema,
});

export interface ServiceIdentity {
  readonly name: string;
  readonly environment: RuntimeEnvironment;
}

export function createServiceIdentity(input: unknown): ServiceIdentity {
  return ServiceIdentitySchema.parse(input);
}
