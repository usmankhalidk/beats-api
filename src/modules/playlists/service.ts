import { Errors } from '@utils/api-error';
import { prisma } from '@utils/prisma-client';
import * as playlistsRepo from './repository';
import type { PlaylistListRow } from './repository';
import type { AddBeatToPlaylistInput, CreatePlaylistInput } from './validation';

export interface PlaylistItemDTO {
  id: string;
  beatId: string;
  beatName: string;
  beatSlug: string;
  thumbnail: string | null;
  position: number;
  addedAt: string | null;
}

export interface PlaylistDTO {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  itemCount: number;
  items: PlaylistItemDTO[];
  createdAt: string | null;
}

function mapPlaylist(row: PlaylistListRow): PlaylistDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    isPublic: row.is_public,
    itemCount: row.items.length,
    items: row.items.map((pi) => ({
      id: pi.id,
      beatId: pi.item_id,
      beatName: pi.item.name,
      beatSlug: pi.item.slug,
      thumbnail: pi.item.thumbnail ?? null,
      position: pi.position,
      addedAt: pi.created_at?.toISOString() ?? null,
    })),
    createdAt: row.created_at?.toISOString() ?? null,
  };
}

export async function listMyPlaylists(userId: string): Promise<PlaylistDTO[]> {
  const rows = await playlistsRepo.listForUser(userId);
  return rows.map(mapPlaylist);
}

export async function createPlaylist(
  userId: string,
  input: CreatePlaylistInput,
): Promise<PlaylistDTO> {
  const row = await playlistsRepo.create({
    user_id: userId,
    name: input.name,
    description: input.description,
    is_public: input.isPublic,
  });
  return mapPlaylist(row);
}

export async function addBeat(
  userId: string,
  playlistId: string,
  input: AddBeatToPlaylistInput,
): Promise<void> {
  const playlist = await playlistsRepo.findByIdForUser(playlistId, userId);
  if (!playlist) throw Errors.notFound({ resource: 'playlist' });

  const beat = await prisma.items.findFirst({
    where: { id: input.beatId, status: 1 },
    select: { id: true },
  });
  if (!beat) throw Errors.notFound({ resource: 'beat' });

  const already = await playlistsRepo.beatExistsInPlaylist(playlistId, input.beatId);
  if (already) throw Errors.conflict({ reason: 'beat_already_in_playlist' });

  await playlistsRepo.addItem(playlistId, input.beatId);
}

export async function removeBeat(
  userId: string,
  playlistId: string,
  beatId: string,
): Promise<void> {
  const playlist = await playlistsRepo.findByIdForUser(playlistId, userId);
  if (!playlist) throw Errors.notFound({ resource: 'playlist' });

  const removed = await playlistsRepo.removeItem(playlistId, beatId);
  if (!removed) throw Errors.notFound({ resource: 'playlist_item' });
}
