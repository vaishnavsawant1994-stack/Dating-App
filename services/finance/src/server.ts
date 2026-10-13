import { DenyAllFinanceAccessAuthorizer } from './access.js';
import { buildFinanceApp } from './app.js';
import { loadFinanceConfig } from './config.js';
import { DisabledFinanceLedgerStore } from './store.js';

const config = loadFinanceConfig(process.env);
const app = await buildFinanceApp(config, {
  authorizer: new DenyAllFinanceAccessAuthorizer(),
  store: new DisabledFinanceLedgerStore(),
});

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, 'Finance service shutting down');
  await app.close();
  process.exitCode = 0;
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ host: config.host, port: config.port });
  app.log.info({ host: config.host, port: config.port }, 'Finance service listening');
} catch (error) {
  app.log.error({ err: error }, 'Finance service failed to start');
  process.exitCode = 1;
  await app.close();
}
