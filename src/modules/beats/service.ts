import { Errors } from '@utils/api-error';
import type { PaginationMeta } from '@utils/pagination';
import type {
  CreateBeatInput,
  FeaturedBeatsQuery,
  FilterBeatsQuery,
  FreeBeatsQuery,
  ListBeatsQuery,
  ReplaceBeatInput,
  SearchBeatsQuery,
} from './validation';

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

export type BeatListResult = { items: BeatDTO[]; meta: PaginationMeta };

export async function listBeats(_query: ListBeatsQuery): Promise<BeatListResult> {
  throw Errors.notImplemented({ feature: 'beats.list' });
}

export async function searchBeats(_query: SearchBeatsQuery): Promise<BeatListResult> {
  throw Errors.notImplemented({ feature: 'beats.search' });
}

export async function filterBeats(_query: FilterBeatsQuery): Promise<BeatListResult> {
  throw Errors.notImplemented({ feature: 'beats.filter' });
}

export async function featuredBeats(_query: FeaturedBeatsQuery): Promise<BeatListResult> {
  throw Errors.notImplemented({ feature: 'beats.featured' });
}

export async function freeBeats(_query: FreeBeatsQuery): Promise<BeatListResult> {
  throw Errors.notImplemented({ feature: 'beats.free' });
}

export async function getBeat(_id: string): Promise<BeatDTO> {
  throw Errors.notImplemented({ feature: 'beats.get' });
}

export async function createBeat(_producerId: string, _input: CreateBeatInput): Promise<BeatDTO> {
  throw Errors.notImplemented({ feature: 'beats.create' });
}

export async function replaceBeat(_producerId: string, _id: string, _input: ReplaceBeatInput): Promise<BeatDTO> {
  throw Errors.notImplemented({ feature: 'beats.replace' });
}

export async function deleteBeat(_producerId: string, _id: string): Promise<void> {
  throw Errors.notImplemented({ feature: 'beats.delete' });
}
