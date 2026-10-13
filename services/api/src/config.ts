import { BaseServerEnvironmentSchema, parseEnvironment, type EnvironmentSource } from '@together/config';
import { z } from 'zod';

export const ApiEnvironmentSchema = BaseServerEnvironmentSchema.extend({
  SERVICE_NAME: z.literal('api').default('api'),
  HOST: z.string().trim().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  DATABASE_URL: z.string().trim().min(1),
  BUILD_ID: z.string().trim().min(1).default('dev'),
});

export type ApiEnvironment = z.infer<typeof ApiEnvironmentSchema>;

export function loadApiEnvironment(source: EnvironmentSource = process.env): ApiEnvironment {
  return parseEnvironment(ApiEnvironmentSchema, source);
}
