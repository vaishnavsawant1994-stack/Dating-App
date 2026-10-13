import { type RuntimeEnvironment } from '@together/config';
import { type DatabaseHealth } from '@together/database';

export interface ApiApplicationConfig {
  readonly serviceName: string;
  readonly environment: RuntimeEnvironment;
  readonly buildId: string;
  readonly logLevel: string;
  readonly bodyLimitBytes: number;
  readonly logging: boolean;
}

export interface ApiDependencies {
  readonly checkDatabaseHealth: () => Promise<DatabaseHealth>;
}
