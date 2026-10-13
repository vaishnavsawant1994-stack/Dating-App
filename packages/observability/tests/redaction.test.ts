import { describe, expect, it } from 'vitest';
import { redactSensitiveRecord, REDACTED_VALUE } from '../src/index.js';

describe('@together/observability redaction', () => {
  it('redacts configured sensitive values recursively', () => {
    expect(
      redactSensitiveRecord({
        authorization: 'Bearer secret',
        nested: {
          precise_location: '18.5204,73.8567',
          safe: 'visible',
        },
        records: [{ government_id: 'sensitive-id' }],
      }),
    ).toEqual({
      authorization: REDACTED_VALUE,
      nested: {
        precise_location: REDACTED_VALUE,
        safe: 'visible',
      },
      records: [{ government_id: REDACTED_VALUE }],
    });
  });
});
