import { z } from 'zod';

const bigIntId = z.string().regex(/^\d+$/, 'id must be a positive integer');

export const playlistIdParamSchema = z.object({ id: bigIntId });
export type PlaylistIdParam = z.infer<typeof playlistIdParamSchema>;

export const playlistBeatParamSchema = z.object({
  id: bigIntId,
  beatId: bigIntId,
});
export type PlaylistBeatParam = z.infer<typeof playlistBeatParamSchema>;

export const createPlaylistBodySchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).optional(),
  isPublic: z.boolean().default(false),
}).strict();
export type CreatePlaylistInput = z.infer<typeof createPlaylistBodySchema>;

export const addBeatToPlaylistBodySchema = z.object({
  beatId: bigIntId,
}).strict();
export type AddBeatToPlaylistInput = z.infer<typeof addBeatToPlaylistBodySchema>;
