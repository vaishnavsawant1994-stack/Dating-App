import { DenyAllMediaAccessAuthorizer } from './access.js';
import { buildMediaApp } from './app.js';
import { loadMediaConfig } from './config.js';
import { S3MediaStorageAdapter } from './storage.js';

const config = loadMediaConfig(process.env);
const storage = new S3MediaStorageAdapter(config);
const app = await buildMediaApp(config, {
  storage,
  authorizer: new DenyAllMediaAccessAuthorizer(),
});

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, 'Media service shutting down');
  await app.close();
  process.exitCode = 0;
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ host: config.host, port: config.port });
  app.log.info({ host: config.host, port: config.port }, 'Media service listening');
} catch (error) {
  app.log.error({ err: error }, 'Media service failed to start');
  process.exitCode = 1;
  await app.close();
}
