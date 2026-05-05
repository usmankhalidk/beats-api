import { z } from 'zod';

export const downloadIdParamSchema = z.object({
  id: z.string().uuid(),
});
export type DownloadIdParam = z.infer<typeof downloadIdParamSchema>;
