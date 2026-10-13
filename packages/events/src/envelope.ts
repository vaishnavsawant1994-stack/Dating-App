import { z } from 'zod';

export const EventEnvelopeBaseSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string().regex(/^[A-Z][A-Za-z0-9]+$/),
  version: z.number().int().positive(),
  occurred_at: z.string().datetime({ offset: true }),
  producer: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  entity_type: z.string().regex(/^[a-z][a-z0-9_]*$/),
  entity_id: z.string().uuid(),
  correlation_id: z.string().uuid(),
  causation_id: z.string().uuid().optional(),
});

export function createEventEnvelopeSchema<TPayload extends z.ZodType>(payload: TPayload) {
  return EventEnvelopeBaseSchema.extend({ payload });
}

export type EventEnvelopeBase = z.infer<typeof EventEnvelopeBaseSchema>;
export type DomainEventEnvelope<TPayload extends Record<string, unknown> = Record<string, unknown>> =
  EventEnvelopeBase & {
    readonly payload: TPayload;
  };
