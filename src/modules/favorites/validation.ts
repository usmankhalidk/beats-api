import { z } from 'zod';

const uuidId = z.string().uuid('must be a valid UUID');

export const addFavoriteBodySchema = z.object({ beatId: uuidId }).strict();
export type AddFavoriteInput = z.infer<typeof addFavoriteBodySchema>;

export const favoriteBeatIdParamSchema = z.object({ beatId: uuidId });
export type FavoriteBeatIdParam = z.infer<typeof favoriteBeatIdParamSchema>;
