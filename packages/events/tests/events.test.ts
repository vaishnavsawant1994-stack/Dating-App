import { describe, expect, it } from 'vitest';
import {
  assertBroadEventPayloadSafe,
  EventSchemaRegistry,
  findProhibitedEventPayloadKeys,
  PlatformSmokeEventSchema,
  PlatformSmokeEventType,
  PlatformSmokeEventVersion,
} from '../src/index.js';

const validEvent = {
  event_id: '123e4567-e89b-42d3-a456-426614174000',
  event_type: PlatformSmokeEventType,
  version: PlatformSmokeEventVersion,
  occurred_at: '2026-10-13T16:00:00+00:00',
  producer: 'stage0-worker',
  entity_type: 'platform_probe',
  entity_id: '123e4567-e89b-42d3-a456-426614174001',
  correlation_id: '123e4567-e89b-42d3-a456-426614174002',
  payload: {
    probe_id: '123e4567-e89b-42d3-a456-426614174003',
    message: 'stage0-smoke',
  },
};

describe('@together/events', () => {
  it('validates the versioned Stage 0 smoke event', () => {
    expect(PlatformSmokeEventSchema.parse(validEvent).version).toBe(1);
  });

  it('registers and resolves schemas by immutable event type/version', () => {
    const registry = new EventSchemaRegistry();
    registry.register(PlatformSmokeEventType, PlatformSmokeEventVersion, PlatformSmokeEventSchema);
    expect(registry.has(PlatformSmokeEventType, 1)).toBe(true);
    expect(registry.parse(PlatformSmokeEventType, 1, validEvent)).toBeDefined();
    expect(() => registry.parse(PlatformSmokeEventType, 2, validEvent)).toThrow();
  });

  it('rejects duplicate schema registration', () => {
    const registry = new EventSchemaRegistry();
    registry.register(PlatformSmokeEventType, 1, PlatformSmokeEventSchema);
    expect(() => registry.register(PlatformSmokeEventType, 1, PlatformSmokeEventSchema)).toThrow();
  });

  it('detects prohibited raw PII and secrets in broad event payloads', () => {
    expect(findProhibitedEventPayloadKeys({ nested: { email: 'private@example.test' } })).toEqual([
      '$.nested.email',
    ]);
    expect(() => assertBroadEventPayloadSafe({ precise_location: 'hidden' })).toThrow();
    expect(() => assertBroadEventPayloadSafe({ user_id: 'opaque-id', reason_code: 'SAFE' })).not.toThrow();
  });
});
