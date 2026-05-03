import { Errors } from '@utils/api-error';
import type {
  AddBeatToPlaylistInput,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from './validation';

export interface PlaylistDTO {
  id: string;
  name: string;
}

export async function listMyPlaylists(_userId: string): Promise<PlaylistDTO[]> {
  throw Errors.notImplemented({ feature: 'playlists.list' });
}

export async function getPlaylist(_userId: string, _id: string): Promise<PlaylistDTO> {
  throw Errors.notImplemented({ feature: 'playlists.get' });
}

export async function createPlaylist(_userId: string, _input: CreatePlaylistInput): Promise<PlaylistDTO> {
  throw Errors.notImplemented({ feature: 'playlists.create' });
}

export async function updatePlaylist(_userId: string, _id: string, _input: UpdatePlaylistInput): Promise<PlaylistDTO> {
  throw Errors.notImplemented({ feature: 'playlists.update' });
}

export async function deletePlaylist(_userId: string, _id: string): Promise<void> {
  throw Errors.notImplemented({ feature: 'playlists.delete' });
}

export async function addBeat(_userId: string, _playlistId: string, _input: AddBeatToPlaylistInput): Promise<void> {
  throw Errors.notImplemented({ feature: 'playlists.addBeat' });
}

export async function removeBeat(_userId: string, _playlistId: string, _beatId: string): Promise<void> {
  throw Errors.notImplemented({ feature: 'playlists.removeBeat' });
}
