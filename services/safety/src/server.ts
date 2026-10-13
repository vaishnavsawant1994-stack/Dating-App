import { DenyAllSafetyAccessAuthorizer } from './access.js';
import { buildSafetyApp } from './app.js';
import { loadSafetyConfig } from './config.js';
import { DisabledSafetyReportStore } from './store.js';

const config = loadSafetyConfig(process.env);
const app = await buildSafetyApp(config, {
  authorizer: new DenyAllSafetyAccessAuthorizer(),
  store: new DisabledSafetyReportStore(),
});

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, 'Safety service shutting down');
  await app.close();
  process.exitCode = 0;
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ host: config.host, port: config.port });
  app.log.info({ host: config.host, port: config.port }, 'Safety service listening');
} catch (error) {
  app.log.error({ err: error }, 'Safety service failed to start');
  process.exitCode = 1;
  await app.close();
}
