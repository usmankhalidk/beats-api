import type { Playlist, Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function listForUser(userId: string): Promise<Playlist[]> {
  return prisma.playlist.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}

export async function findByIdForUser(id: string, userId: string): Promise<Playlist | null> {
  return prisma.playlist.findFirst({ where: { id, userId } });
}

export async function create(data: Prisma.PlaylistUncheckedCreateInput): Promise<Playlist> {
  return prisma.playlist.create({ data });
}

export async function update(id: string, data: Prisma.PlaylistUpdateInput): Promise<Playlist> {
  return prisma.playlist.update({ where: { id }, data });
}

export async function remove(id: string): Promise<void> {
  await prisma.playlist.delete({ where: { id } });
}

export async function addBeat(playlistId: string, beatId: string): Promise<void> {
  await prisma.playlistBeat.create({ data: { playlistId, beatId } });
}

export async function removeBeat(playlistId: string, beatId: string): Promise<void> {
  await prisma.playlistBeat.delete({ where: { playlistId_beatId: { playlistId, beatId } } }).catch(() => undefined);
}
