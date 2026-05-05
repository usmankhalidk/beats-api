import { Errors } from '@utils/api-error';
import type { AddBeatToPlaylistInput, CreatePlaylistInput } from './validation';

export interface PlaylistDTO {
  id: string;
  name: string;
}

export async function listMyPlaylists(_userId: string): Promise<PlaylistDTO[]> {
  throw Errors.notImplemented({ feature: 'playlists.list' });
}

export async function createPlaylist(_userId: string, _input: CreatePlaylistInput): Promise<PlaylistDTO> {
  throw Errors.notImplemented({ feature: 'playlists.create' });
}

export async function addBeat(
  _userId: string,
  _playlistId: string,
  _input: AddBeatToPlaylistInput,
): Promise<void> {
  throw Errors.notImplemented({ feature: 'playlists.addBeat' });
}

export async function removeBeat(_userId: string, _playlistId: string, _beatId: string): Promise<void> {
  throw Errors.notImplemented({ feature: 'playlists.removeBeat' });
}
