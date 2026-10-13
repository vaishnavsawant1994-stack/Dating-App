import { z } from 'zod';
import { type MediaBucketClass } from './types.js';

export const allowedContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
] as const;

export const uploadIntentSchema = z.object({
  kind: z.enum(['profile_photo', 'post_image', 'post_video', 'voice_note', 'other']),
  visibility: z.enum(['public', 'private']),
  content_type: z.enum(allowedContentTypes),
  size_bytes: z.number().int().positive().max(262_144_000),
  checksum_sha256: z.string().regex(/^[A-Za-z0-9+/]{43}=$/).optional(),
}).strict();

export type UploadIntent = z.infer<typeof uploadIntentSchema>;

const maxBytesByContentType: Readonly<Record<(typeof allowedContentTypes)[number], number>> = {
  'image/jpeg': 25_000_000,
  'image/png': 25_000_000,
  'image/webp': 25_000_000,
  'image/heic': 25_000_000,
  'video/mp4': 250_000_000,
  'video/quicktime': 250_000_000,
  'audio/mpeg': 25_000_000,
  'audio/mp4': 25_000_000,
  'audio/wav': 25_000_000,
};

const extensionByContentType: Readonly<Record<(typeof allowedContentTypes)[number], string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
};

export function mediaSizeAllowed(intent: UploadIntent): boolean {
  return intent.size_bytes <= maxBytesByContentType[intent.content_type];
}

export function bucketClassForIntent(intent: UploadIntent): MediaBucketClass {
  return intent.visibility;
}

export function createObjectKey(intent: UploadIntent, mediaId: string, at: Date): string {
  const year = String(at.getUTCFullYear());
  const month = String(at.getUTCMonth() + 1).padStart(2, '0');
  return `media/v1/${intent.visibility}/${year}/${month}/${mediaId}.${extensionByContentType[intent.content_type]}`;
}
