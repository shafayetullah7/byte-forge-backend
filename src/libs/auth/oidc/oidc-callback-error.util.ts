import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

export const OIDC_CALLBACK_ERROR_CODES = [
  'access_denied',
  'login_required',
  'temporarily_unavailable',
  'email_unverified',
  'account_inactive',
  'identity_conflict',
  'provision_failed',
  'token_exchange_failed',
  'failed',
] as const;

export type OidcCallbackErrorCode = (typeof OIDC_CALLBACK_ERROR_CODES)[number];

const ALLOWED = new Set<string>(OIDC_CALLBACK_ERROR_CODES);

const EMAIL_MUST_BE_VERIFIED = 'Email must be verified';

/**
 * Map an IdP `error` query value to a closed set shown on the storefront.
 * Unknown or empty values become `failed` so we never echo raw IdP strings.
 */
export function mapOidcCallbackError(
  error: string | undefined | null,
): OidcCallbackErrorCode {
  const raw = error?.trim();
  if (raw && ALLOWED.has(raw)) {
    return raw as OidcCallbackErrorCode;
  }
  return 'failed';
}

function readHttpExceptionMessage(error: {
  getResponse: () => string | object;
}): string | undefined {
  const response = error.getResponse();
  if (typeof response === 'string') {
    return response;
  }
  if (
    typeof response === 'object' &&
    response !== null &&
    'message' in response
  ) {
    const message = (response as { message?: string | string[] }).message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0];
    }
  }
  return undefined;
}

/**
 * Map provision-time Nest exceptions to closed storefront `oidc_error` codes.
 */
export function mapOidcProvisionFailure(error: unknown): OidcCallbackErrorCode {
  if (error instanceof ForbiddenException) {
    return 'account_inactive';
  }
  if (error instanceof ConflictException) {
    return 'identity_conflict';
  }
  if (error instanceof UnauthorizedException) {
    const message = readHttpExceptionMessage(error);
    if (message === EMAIL_MUST_BE_VERIFIED) {
      return 'email_unverified';
    }
  }
  return 'provision_failed';
}

export function buildOidcLoginErrorUrl(
  frontendUrl: string,
  error: string | undefined | null,
): string {
  const code = mapOidcCallbackError(error);
  return `${frontendUrl.replace(/\/$/, '')}/login?oidc_error=${encodeURIComponent(code)}`;
}
