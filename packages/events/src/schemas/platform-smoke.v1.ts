import { z } from 'zod';
import { createEventEnvelopeSchema } from '../envelope.js';

export const PlatformSmokeEventType = 'PlatformSmokeEvent' as const;
export const PlatformSmokeEventVersion = 1 as const;

export const PlatformSmokePayloadSchema = z.object({
  probe_id: z.string().uuid(),
  message: z.literal('stage0-smoke'),
});

export const PlatformSmokeEventSchema = createEventEnvelopeSchema(PlatformSmokePayloadSchema).refine(
  (event) => event.event_type === PlatformSmokeEventType && event.version === PlatformSmokeEventVersion,
  { message: 'Platform smoke event type/version mismatch' },
);
