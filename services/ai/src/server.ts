import { DenyAllAiAccessAuthorizer } from './access.js';
import { buildAiApp } from './app.js';
import { loadAiConfig } from './config.js';
import { createAiProvider } from './provider-factory.js';

const config = loadAiConfig(process.env);
const provider = createAiProvider(config);
const app = await buildAiApp(config, {
  provider,
  authorizer: new DenyAllAiAccessAuthorizer(),
});

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, 'AI service shutting down');
  await app.close();
  process.exitCode = 0;
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ host: config.host, port: config.port });
  app.log.info({ host: config.host, port: config.port }, 'AI service listening');
} catch (error) {
  app.log.error({ err: error }, 'AI service failed to start');
  process.exitCode = 1;
  await app.close();
}
