import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import { HTTP_STATUS } from '@constants/http-status';
import * as beatsService from './service';
import type { BeatFileInput } from './service';
import type {
  FeaturedBeatsQuery,
  FilterBeatsQuery,
  FreeBeatsQuery,
  ListBeatsQuery,
  SearchBeatsQuery,
} from './validation';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function list(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await beatsService.listBeats(req.query as unknown as ListBeatsQuery);
  return successResponse(res, { data: items, meta: { ...meta } });
}

export async function search(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await beatsService.searchBeats(req.query as unknown as SearchBeatsQuery);
  return successResponse(res, { data: items, meta: { ...meta } });
}

export async function filter(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await beatsService.filterBeats(req.query as unknown as FilterBeatsQuery);
  return successResponse(res, { data: items, meta: { ...meta } });
}

export async function featured(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await beatsService.featuredBeats(
    req.query as unknown as FeaturedBeatsQuery,
  );
  return successResponse(res, { data: items, meta: { ...meta } });
}

export async function free(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await beatsService.freeBeats(req.query as unknown as FreeBeatsQuery);
  return successResponse(res, { data: items, meta: { ...meta } });
}

export async function get(req: Request, res: Response): Promise<Response> {
  const data = await beatsService.getBeat(req.params.id as string);
  return successResponse(res, { data });
}

function extractFiles(req: Request): { beatFile?: BeatFileInput; coverFile?: BeatFileInput } {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const beat = files?.['beatFile']?.[0];
  const cover = files?.['coverImage']?.[0];
  return {
    beatFile: beat ? { buffer: beat.buffer, originalname: beat.originalname, mimetype: beat.mimetype } : undefined,
    coverFile: cover ? { buffer: cover.buffer, originalname: cover.originalname, mimetype: cover.mimetype } : undefined,
  };
}

export async function create(req: Request, res: Response): Promise<Response> {
  const { beatFile, coverFile } = extractFiles(req);
  if (!beatFile) throw Errors.badRequest({ reason: 'beatFile is required' });
  const data = await beatsService.createBeat(requireUserId(req), req.body, beatFile, coverFile);
  return successResponse(res, { data, message: 'BEAT_CREATED', code: HTTP_STATUS.CREATED });
}

export async function replace(req: Request, res: Response): Promise<Response> {
  const { beatFile, coverFile } = extractFiles(req);
  const data = await beatsService.replaceBeat(requireUserId(req), req.params.id as string, req.body, beatFile, coverFile);
  return successResponse(res, { data, message: 'BEAT_UPDATED' });
}

export async function remove(req: Request, res: Response): Promise<Response> {
  await beatsService.deleteBeat(requireUserId(req), req.params.id as string);
  return successResponse(res, { data: null, message: 'BEAT_DELETED' });
}
