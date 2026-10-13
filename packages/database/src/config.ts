import { parseEnvironment, RuntimeEnvironmentSchema } from '@together/config';
import { z } from 'zod';

export const DatabaseEnvironmentSchema = z.object({
  APP_ENV: RuntimeEnvironmentSchema.default('local'),
  DATABASE_URL: z.string().trim().min(1),
});

export interface DatabaseConfig {
  readonly connectionString: string;
  readonly applicationName: string;
  readonly maxConnections?: number;
  readonly requireTls?: boolean;
}

export function loadDatabaseCliConfig(): DatabaseConfig {
  const environment = parseEnvironment(DatabaseEnvironmentSchema);
  return {
    connectionString: environment.DATABASE_URL,
    applicationName: `together-migrations-${environment.APP_ENV}`,
    requireTls: environment.APP_ENV === 'production',
  };
}
