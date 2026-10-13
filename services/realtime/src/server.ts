import { DenyAllTokenVerifier } from './auth.js';
import { buildRealtimeApp } from './app.js';
import { loadRealtimeConfig } from './config.js';

const config = loadRealtimeConfig(process.env);
const app = await buildRealtimeApp(config, { tokenVerifier: new DenyAllTokenVerifier() });

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, 'Realtime service shutting down');
  await app.close();
  process.exitCode = 0;
}

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});
process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

try {
  await app.listen({ host: config.host, port: config.port });
  app.log.info({ port: config.port, host: config.host }, 'Realtime service listening');
} catch (error) {
  app.log.error({ err: error }, 'Realtime service failed to start');
  process.exitCode = 1;
  await app.close();
}
