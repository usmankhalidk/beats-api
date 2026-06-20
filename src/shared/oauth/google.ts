import { OAuth2Client } from 'google-auth-library';
import { config } from '@config/index';
import { Errors } from '@utils/api-error';
import { logger } from '@utils/logger';

/**
 * A Google identity verified from an ID token. Only the fields we persist or use
 * to provision an account are surfaced; everything else from the token is ignored.
 */
export interface GoogleIdentity {
  /** Google's stable user id (the token `sub`) → stored as `users.google_id`. */
  googleId: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  picture: string | null;
}

// The client carries no secret — it is only used to verify ID-token signatures
// against Google's rotating public certs (which the library caches internally).
const client = new OAuth2Client();

export function isGoogleSignInEnabled(): boolean {
  return config.oauth.google.clientIds.length > 0;
}

/**
 * Verify a Google-issued ID token (signature, expiry, issuer) and confirm its
 * audience is one of our configured client IDs. Returns the normalised identity,
 * or throws an operational error the global handler maps to 4xx.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  if (!isGoogleSignInEnabled()) {
    throw Errors.badRequest({ reason: 'google_signin_not_configured' });
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.oauth.google.clientIds,
    });
    payload = ticket.getPayload();
  } catch (err) {
    logger.warn('google.idtoken.invalid', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw Errors.unauthorized({ reason: 'invalid_google_token' });
  }

  if (!payload?.sub || !payload.email) {
    throw Errors.unauthorized({ reason: 'invalid_google_token' });
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: payload.email_verified === true,
    firstName: payload.given_name ?? null,
    lastName: payload.family_name ?? null,
    picture: payload.picture ?? null,
  };
}
