import { z } from 'zod';

export const playlistIdParamSchema = z.object({ id: z.string().uuid() });
export type PlaylistIdParam = z.infer<typeof playlistIdParamSchema>;

export const playlistBeatParamSchema = z.object({
  id: z.string().uuid(),
  beatId: z.string().uuid(),
});
export type PlaylistBeatParam = z.infer<typeof playlistBeatParamSchema>;

export const createPlaylistBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
});
export type CreatePlaylistInput = z.infer<typeof createPlaylistBodySchema>;

export const updatePlaylistBodySchema = createPlaylistBodySchema.partial();
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistBodySchema>;

export const addBeatToPlaylistBodySchema = z.object({
  beatId: z.string().uuid(),
});
export type AddBeatToPlaylistInput = z.infer<typeof addBeatToPlaylistBodySchema>;
