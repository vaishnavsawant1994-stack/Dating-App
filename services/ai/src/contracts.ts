import { z } from 'zod';

const common = z.object({
  purpose: z.string().min(3).max(128),
});

const generate = common.extend({
  operation: z.literal('generate'),
  payload: z.object({
    prompt: z.string().min(1),
    max_output_tokens: z.number().int().min(1).optional(),
  }).strict(),
}).strict();

const embed = common.extend({
  operation: z.literal('embed'),
  payload: z.object({
    input: z.union([z.string().min(1), z.array(z.string().min(1)).min(1).max(32)]),
  }).strict(),
}).strict();

const classify = common.extend({
  operation: z.literal('classify'),
  payload: z.object({
    input: z.string().min(1),
    labels: z.array(z.string().min(1).max(64)).min(1).max(32),
  }).strict(),
}).strict();

const moderate = common.extend({
  operation: z.literal('moderate'),
  payload: z.object({ input: z.string().min(1) }).strict(),
}).strict();

const translate = common.extend({
  operation: z.literal('translate'),
  payload: z.object({
    input: z.string().min(1),
    target_language: z.string().min(2).max(32),
  }).strict(),
}).strict();

const extractStructured = common.extend({
  operation: z.literal('extract_structured'),
  payload: z.object({
    input: z.string().min(1),
    fields: z.array(z.string().regex(/^[a-z][a-z0-9_]{0,63}$/)).min(1).max(64),
  }).strict(),
}).strict();

export const aiRequestSchema = z.discriminatedUnion('operation', [
  generate,
  embed,
  classify,
  moderate,
  translate,
  extractStructured,
]);

export type AiRequest = z.infer<typeof aiRequestSchema>;

export function requestInputCharacters(request: AiRequest): number {
  switch (request.operation) {
    case 'embed':
      return Array.isArray(request.payload.input)
        ? request.payload.input.reduce((sum, value) => sum + value.length, 0)
        : request.payload.input.length;
    case 'generate':
      return request.payload.prompt.length;
    case 'classify':
    case 'moderate':
    case 'translate':
    case 'extract_structured':
      return request.payload.input.length;
  }
}
