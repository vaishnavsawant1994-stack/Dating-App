import { z } from 'zod';

export const PageMetaSchema = z.object({
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
});

export type PageMeta = z.infer<typeof PageMetaSchema>;

export function createCollectionEnvelopeSchema<TItem extends z.ZodType>(item: TItem) {
  return z.object({
    data: z.array(item),
    page: PageMetaSchema,
    meta: z.object({ request_id: z.string().uuid() }),
  });
}
