import { type DomainEventEnvelope } from '@together/events';
import { type PoolClient } from 'pg';

export async function enqueueOutboxEvent(
  client: PoolClient,
  event: DomainEventEnvelope,
): Promise<void> {
  await client.query(
    `INSERT INTO ops.outbox_events (
      id,
      event_type,
      event_version,
      aggregate_type,
      aggregate_id,
      correlation_id,
      causation_id,
      payload,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::timestamptz)`,
    [
      event.event_id,
      event.event_type,
      event.version,
      event.entity_type,
      event.entity_id,
      event.correlation_id,
      event.causation_id ?? null,
      JSON.stringify(event.payload),
      event.occurred_at,
    ],
  );
}

export async function markEventProcessed(
  client: PoolClient,
  consumerName: string,
  eventId: string,
): Promise<boolean> {
  const result = await client.query(
    `INSERT INTO ops.processed_events (consumer_name, event_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [consumerName, eventId],
  );
  return result.rowCount === 1;
}
