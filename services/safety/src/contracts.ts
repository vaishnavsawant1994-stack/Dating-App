import { z } from 'zod';

export const SAFETY_CONTRACT_VERSION = 1 as const;

export const safetyReportCategories = [
  'fake_profile',
  'impersonation',
  'scam_money',
  'harassment',
  'sexual_content',
  'threat',
  'underage',
  'stolen_media',
  'spam',
  'other',
] as const;

export const safetyTargetTypes = [
  'user',
  'identity',
  'message',
  'post',
  'community',
  'event',
  'live_stream',
  'creator',
] as const;

const entityRefSchema = z.object({
  type: z.enum(['message', 'post', 'media', 'community', 'event', 'live_stream']),
  id: z.string().uuid(),
}).strict();

export const submitSafetyReportSchema = z.object({
  v: z.literal(SAFETY_CONTRACT_VERSION),
  target: z.object({
    type: z.enum(safetyTargetTypes),
    id: z.string().uuid(),
  }).strict(),
  category: z.enum(safetyReportCategories),
  note: z.string().trim().min(1).max(2_000).optional(),
  related_entity_refs: z.array(entityRefSchema).max(10).default([]),
}).strict();

export type SubmitSafetyReport = z.infer<typeof submitSafetyReportSchema>;
