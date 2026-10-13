import { checkDatabaseHealth, createDatabasePool } from '@together/database';
import { buildApiApp } from './app.js';
import { loadApiEnvironment } from './config.js';

const environment = loadApiEnvironment();
const pool = createDatabasePool({
  connectionString: environment.DATABASE_URL,
  applicationName: 'together-api',
  requireTls: environment.APP_ENV === 'production',
});

const app = await buildApiApp(
  {
    serviceName: environment.SERVICE_NAME,
    environment: environment.APP_ENV,
    buildId: environment.BUILD_ID,
    logLevel: environment.LOG_LEVEL,
    bodyLimitBytes: 1024 * 1024,
    logging: true,
  },
  { checkDatabaseHealth: () => checkDatabaseHealth(pool) },
);

app.addHook('onClose', async () => {
  await pool.end();
});

await app.listen({ host: environment.HOST, port: environment.PORT });

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  app.log.info({ signal }, 'Graceful shutdown requested');
  const forcedExit = setTimeout(() => {
    app.log.error({ signal }, 'Graceful shutdown deadline exceeded');
    process.exit(1);
  }, 10_000);
  forcedExit.unref();

  try {
    await app.close();
    clearTimeout(forcedExit);
  } catch (error) {
    app.log.error({ err: error }, 'Graceful shutdown failed');
    process.exitCode = 1;
  }
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
