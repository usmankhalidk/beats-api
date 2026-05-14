import { prisma } from '@utils/prisma-client';

const ITEM_SELECT = {
  id: true,
  item_id: true,
  position: true,
  created_at: true,
  item: {
    select: { id: true, name: true, slug: true, thumbnail: true },
  },
} as const;

const PLAYLIST_INCLUDE = {
  items: { orderBy: { position: 'asc' as const }, select: ITEM_SELECT },
} as const;

export type PlaylistRow = Awaited<ReturnType<typeof findByIdForUser>>;
export type PlaylistListRow = Awaited<ReturnType<typeof listForUser>>[number];

export async function listForUser(userId: string) {
  return prisma.playlists.findMany({
    where: { user_id: userId },
    orderBy: { name: 'asc' },
    include: PLAYLIST_INCLUDE,
  });
}

export async function findByIdForUser(id: string, userId: string) {
  return prisma.playlists.findFirst({
    where: { id, user_id: userId },
    include: PLAYLIST_INCLUDE,
  });
}

export async function create(data: {
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
}) {
  return prisma.playlists.create({ data, include: PLAYLIST_INCLUDE });
}

export async function addItem(playlistId: string, itemId: string): Promise<void> {
  const maxPos = await prisma.playlist_items.aggregate({
    where: { playlist_id: playlistId },
    _max: { position: true },
  });
  const position = (maxPos._max.position ?? -1) + 1;
  await prisma.playlist_items.create({
    data: { playlist_id: playlistId, item_id: itemId, position },
  });
}

export async function removeItem(playlistId: string, itemId: string): Promise<boolean> {
  const deleted = await prisma.playlist_items.deleteMany({
    where: { playlist_id: playlistId, item_id: itemId },
  });
  return deleted.count > 0;
}

export async function beatExistsInPlaylist(playlistId: string, itemId: string): Promise<boolean> {
  const row = await prisma.playlist_items.findFirst({
    where: { playlist_id: playlistId, item_id: itemId },
    select: { id: true },
  });
  return row !== null;
}
