import { describe, expect, it } from 'vitest';
import { submitSafetyReportSchema } from '../src/contracts.js';

const targetId = '018f0c18-7b9d-7a1c-8d23-9cfdb65b4a11';

describe('Safety report contract', () => {
  it('accepts a versioned structured report with referenced evidence only', () => {
    const result = submitSafetyReportSchema.safeParse({
      v: 1,
      target: { type: 'identity', id: targetId },
      category: 'impersonation',
      note: 'The account appears to be impersonating someone.',
      related_entity_refs: [{ type: 'post', id: targetId }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects raw evidence/message bodies and unknown report categories', () => {
    expect(submitSafetyReportSchema.safeParse({
      v: 1,
      target: { type: 'user', id: targetId },
      category: 'harassment',
      raw_message: 'private message contents',
    }).success).toBe(false);
    expect(submitSafetyReportSchema.safeParse({
      v: 1,
      target: { type: 'user', id: targetId },
      category: 'public_trust_score',
    }).success).toBe(false);
  });

  it('rejects unversioned reports and overlong free text', () => {
    expect(submitSafetyReportSchema.safeParse({
      target: { type: 'user', id: targetId }, category: 'spam',
    }).success).toBe(false);
    expect(submitSafetyReportSchema.safeParse({
      v: 1, target: { type: 'user', id: targetId }, category: 'spam', note: 'x'.repeat(2_001),
    }).success).toBe(false);
  });
});
