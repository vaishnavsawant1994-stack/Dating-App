import { z } from 'zod';

export const CursorSchema = z.string().min(1).max(2048);
export const PageLimitSchema = z.coerce.number().int().min(1).max(100).default(30);

export const CursorPaginationSchema = z.object({
  cursor: CursorSchema.optional(),
  limit: PageLimitSchema,
});

export type CursorPagination = z.infer<typeof CursorPaginationSchema>;
