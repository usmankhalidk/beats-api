import { Errors } from '@utils/api-error';

export interface DownloadGrantDTO {
  downloadId: string;
  beatId: string;
  url: string;
  expiresAt: Date;
}

/**
 * Issue a (signed) download URL for a download grant the user owns.
 * Until file storage is wired, this throws NOT_IMPLEMENTED.
 */
export async function getDownloadGrant(_userId: string, _downloadId: string): Promise<DownloadGrantDTO> {
  throw Errors.notImplemented({ feature: 'downloads.get' });
}
