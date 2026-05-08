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

export async function create(req: Request, res: Response): Promise<Response> {
  const data = await playlistsService.createPlaylist(requireUserId(req), req.body);
  return successResponse(res, { data, message: 'PLAYLIST_CREATED', code: HTTP_STATUS.CREATED });
}

export async function addBeat(req: Request, res: Response): Promise<Response> {
  await playlistsService.addBeat(requireUserId(req), String(req.params['id']), req.body);
  return successResponse(res, { data: null, message: 'BEAT_ADDED_TO_PLAYLIST', code: HTTP_STATUS.CREATED });
}

export async function removeBeat(req: Request, res: Response): Promise<Response> {
  await playlistsService.removeBeat(requireUserId(req), String(req.params['id']), String(req.params['beatId']));
  return successResponse(res, { data: null, message: 'BEAT_REMOVED_FROM_PLAYLIST' });
}
