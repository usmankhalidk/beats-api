import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import { HTTP_STATUS } from '@constants/http-status';
import * as playlistsService from './service';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function list(req: Request, res: Response): Promise<Response> {
  const data = await playlistsService.listMyPlaylists(requireUserId(req));
  return successResponse(res, { data });
}

export async function get(req: Request, res: Response): Promise<Response> {
  const data = await playlistsService.getPlaylist(requireUserId(req), req.params.id);
  return successResponse(res, { data });
}

export async function create(req: Request, res: Response): Promise<Response> {
  const data = await playlistsService.createPlaylist(requireUserId(req), req.body);
  return successResponse(res, { data, message: 'PLAYLIST_CREATED', code: HTTP_STATUS.CREATED });
}

export async function update(req: Request, res: Response): Promise<Response> {
  const data = await playlistsService.updatePlaylist(requireUserId(req), req.params.id, req.body);
  return successResponse(res, { data, message: 'PLAYLIST_UPDATED' });
}

export async function remove(req: Request, res: Response): Promise<Response> {
  await playlistsService.deletePlaylist(requireUserId(req), req.params.id);
  return successResponse(res, { data: null, message: 'PLAYLIST_DELETED' });
}

export async function addBeat(req: Request, res: Response): Promise<Response> {
  await playlistsService.addBeat(requireUserId(req), req.params.id, req.body);
  return successResponse(res, { data: null, message: 'BEAT_ADDED_TO_PLAYLIST' });
}

export async function removeBeat(req: Request, res: Response): Promise<Response> {
  await playlistsService.removeBeat(requireUserId(req), req.params.id, req.params.beatId);
  return successResponse(res, { data: null, message: 'BEAT_REMOVED_FROM_PLAYLIST' });
}
