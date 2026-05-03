import { Errors } from '@utils/api-error';
import type { PaginationMeta } from '@utils/pagination';
import type { CreateBeatInput, ListBeatsQuery, UpdateBeatInput } from './validation';

export interface BeatDTO {
  id: string;
  title: string;
  description: string | null;
  bpm: number;
  priceBasic: string;
  pricePremium: string;
  priceExclusive: string;
  isFree: boolean;
  isExclusiveSold: boolean;
  audioUrl: string | null;
  coverImageUrl: string | null;
  producerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function listBeats(_query: ListBeatsQuery): Promise<{ items: BeatDTO[]; meta: PaginationMeta }> {
  throw Errors.notImplemented({ feature: 'beats.list' });
}

export async function getBeat(_id: string): Promise<BeatDTO> {
  throw Errors.notImplemented({ feature: 'beats.get' });
}

export async function createBeat(_producerId: string, _input: CreateBeatInput): Promise<BeatDTO> {
  throw Errors.notImplemented({ feature: 'beats.create' });
}

export async function updateBeat(_producerId: string, _id: string, _input: UpdateBeatInput): Promise<BeatDTO> {
  throw Errors.notImplemented({ feature: 'beats.update' });
}

export async function deleteBeat(_producerId: string, _id: string): Promise<void> {
  throw Errors.notImplemented({ feature: 'beats.delete' });
}
