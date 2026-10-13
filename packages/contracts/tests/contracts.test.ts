import { fileURLToPath } from 'node:url';
import SwaggerParser from '@apidevtools/swagger-parser';
import { describe, expect, it } from 'vitest';
import { ApiErrorEnvelopeSchema, HealthResponseSchema, RequestContextHeadersSchema } from '../src/index.js';

describe('@together/contracts', () => {
  it('validates the canonical OpenAPI document', async () => {
    const schemaPath = fileURLToPath(new URL('../openapi/base.yaml', import.meta.url));
    const api = await SwaggerParser.validate(schemaPath);
    expect(api).toHaveProperty('openapi', '3.1.0');
  });

  it('parses the public health contract', () => {
    expect(
      HealthResponseSchema.parse({
        status: 'ok',
        service: 'api',
        version: 'build-123',
        environment: 'staging',
      }),
    ).toMatchObject({ status: 'ok', service: 'api' });
  });

  it('does not accept an unknown external error code', () => {
    expect(() =>
      ApiErrorEnvelopeSchema.parse({
        error: {
          code: 'RAW_DATABASE_ERROR',
          message: 'unsafe',
          request_id: '123e4567-e89b-42d3-a456-426614174000',
          retryable: false,
        },
      }),
    ).toThrow();
  });

  it('validates identity-aware request headers without making identity authority client-side', () => {
    expect(
      RequestContextHeadersSchema.parse({
        'x-platform': 'ios',
        'x-identity-id': '123e4567-e89b-42d3-a456-426614174000',
      }),
    ).toMatchObject({ 'x-platform': 'ios' });
  });
});
