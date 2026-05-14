import { z } from 'zod';

export const downloadIdParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});
export type DownloadIdParam = z.infer<typeof downloadIdParamSchema>;
