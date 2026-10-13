import { describe, expect, it } from 'vitest';
import { createObjectKey, mediaSizeAllowed, uploadIntentSchema } from '../src/policy.js';

describe('Media policy', () => {
  it('generates opaque service-owned keys without caller filenames', () => {
    const intent = uploadIntentSchema.parse({
      kind: 'profile_photo', visibility: 'private', content_type: 'image/jpeg', size_bytes: 1_000,
    });
    expect(createObjectKey(intent, 'media-0001', new Date('2026-10-14T00:00:00Z')))
      .toBe('media/v1/private/2026/10/media-0001.jpg');
  });

  it('applies content-type-specific size limits', () => {
    const image = uploadIntentSchema.parse({
      kind: 'post_image', visibility: 'public', content_type: 'image/jpeg', size_bytes: 25_000_001,
    });
    expect(mediaSizeAllowed(image)).toBe(false);
  });

  it('rejects unsupported content types and unexpected fields', () => {
    expect(uploadIntentSchema.safeParse({
      kind: 'other', visibility: 'public', content_type: 'text/html', size_bytes: 100,
    }).success).toBe(false);
    expect(uploadIntentSchema.safeParse({
      kind: 'other', visibility: 'public', content_type: 'image/png', size_bytes: 100, object_key: 'caller/key',
    }).success).toBe(false);
  });
});
