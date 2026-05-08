import { z } from 'zod';

export const downloadIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'id must be a positive integer'),
});
export type DownloadIdParam = z.infer<typeof downloadIdParamSchema>;
