import { Errors } from '@utils/api-error';
import { getSignedBeatUrl } from '@utils/storage';
import * as downloadsRepo from './repository';

const SIGNED_URL_TTL = 3600; // 1 hour

export interface DownloadGrantDTO {
  purchaseId: string;
  beatId: string;
  beatName: string;
  licenseType: 'regular' | 'extended';
  url: string;
  expiresAt: string;
}

export async function getDownloadGrant(
  userId: string,
  purchaseId: string,
): Promise<DownloadGrantDTO> {
  const purchase = await downloadsRepo.findPurchase(purchaseId, userId);
  if (!purchase) throw Errors.notFound({ resource: 'purchase' });

  const { main_file, name } = purchase.items;
  if (!main_file || main_file === 'pending') {
    throw Errors.notFound({ resource: 'beat_file' });
  }

  const url = await getSignedBeatUrl(main_file, SIGNED_URL_TTL);
  const expiresAt = new Date(Date.now() + SIGNED_URL_TTL * 1000).toISOString();

  return {
    purchaseId: purchase.id,
    beatId: purchase.item_id,
    beatName: name,
    licenseType: purchase.license_type ? 'extended' : 'regular',
    url,
    expiresAt,
  };
}
