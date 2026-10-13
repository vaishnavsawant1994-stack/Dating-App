import { type SystemInfo } from '@together/contracts';
import { type FastifyInstance } from 'fastify';
import { type ApiApplicationConfig } from '../types.js';

export function registerSystemRoutes(app: FastifyInstance, config: ApiApplicationConfig): void {
  app.get('/v1/system/info', async (): Promise<SystemInfo> => ({
    service: config.serviceName,
    api_version: 'v1',
    environment: config.environment,
  }));
}
