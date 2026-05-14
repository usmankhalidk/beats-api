import { Errors } from '@utils/api-error';
import { toDTO, type BeatDTO } from '@modules/beats/service';
import * as favoritesRepo from './repository';

export interface FavoriteDTO extends BeatDTO {
  favoritedAt: Date | null;
}

function toFavoriteDTO(row: favoritesRepo.FavoriteWithItem): FavoriteDTO {
  return { ...toDTO(row.items), favoritedAt: row.created_at };
}

export async function listFavorites(userId: string): Promise<FavoriteDTO[]> {
  const rows = await favoritesRepo.listForUser(userId);
  return rows.map(toFavoriteDTO);
}

export async function addFavorite(userId: string, beatId: string): Promise<FavoriteDTO> {
  const beat = await favoritesRepo.findPublishedBeat(beatId);
  if (!beat) throw Errors.notFound({ resource: 'beat', id: beatId });

  if (await favoritesRepo.findByUserAndBeat(userId, beatId)) {
    throw Errors.conflict({ reason: 'already_favorited' });
  }

  const row = await favoritesRepo.add(userId, beatId);
  return toFavoriteDTO(row);
}

export async function removeFavorite(userId: string, beatId: string): Promise<void> {
  const removed = await favoritesRepo.removeByBeat(userId, beatId);
  if (removed === 0) throw Errors.notFound({ resource: 'favorite', beatId });
}
