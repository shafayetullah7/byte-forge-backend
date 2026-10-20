import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  buildOidcLoginErrorUrl,
  mapOidcCallbackError,
  mapOidcProvisionFailure,
} from '../../oidc-callback-error.util';

describe('oidc-callback-error.util', () => {
  it('keeps known IdP and BFF error codes', () => {
    expect(mapOidcCallbackError('access_denied')).toBe('access_denied');
    expect(mapOidcCallbackError('login_required')).toBe('login_required');
    expect(mapOidcCallbackError('temporarily_unavailable')).toBe(
      'temporarily_unavailable',
    );
    expect(mapOidcCallbackError('email_unverified')).toBe('email_unverified');
    expect(mapOidcCallbackError('account_inactive')).toBe('account_inactive');
    expect(mapOidcCallbackError('identity_conflict')).toBe('identity_conflict');
    expect(mapOidcCallbackError('provision_failed')).toBe('provision_failed');
    expect(mapOidcCallbackError('token_exchange_failed')).toBe(
      'token_exchange_failed',
    );
    expect(mapOidcCallbackError('failed')).toBe('failed');
  });

  it('maps unknown or empty values to failed', () => {
    expect(mapOidcCallbackError('server_error')).toBe('failed');
    expect(mapOidcCallbackError('<script>')).toBe('failed');
    expect(mapOidcCallbackError('')).toBe('failed');
    expect(mapOidcCallbackError(undefined)).toBe('failed');
  });

  it('builds a login error URL without echoing raw IdP errors', () => {
    expect(
      buildOidcLoginErrorUrl('http://localhost:3000/', 'access_denied'),
    ).toBe('http://localhost:3000/login?oidc_error=access_denied');
    expect(
      buildOidcLoginErrorUrl('http://localhost:3000', 'not-a-real-error'),
    ).toBe('http://localhost:3000/login?oidc_error=failed');
  });
});

describe('mapOidcProvisionFailure', () => {
  it('maps ForbiddenException to account_inactive', () => {
    expect(
      mapOidcProvisionFailure(new ForbiddenException('Account is inactive')),
    ).toBe('account_inactive');
  });

  it('maps ConflictException to identity_conflict', () => {
    expect(
      mapOidcProvisionFailure(
        new ConflictException('Account already linked to another identity'),
      ),
    ).toBe('identity_conflict');
  });

  it('maps unverified-email UnauthorizedException to email_unverified', () => {
    expect(
      mapOidcProvisionFailure(
        new UnauthorizedException('Email must be verified'),
      ),
    ).toBe('email_unverified');
  });

  it('maps other UnauthorizedException to provision_failed', () => {
    expect(
      mapOidcProvisionFailure(new UnauthorizedException('Invalid access token')),
    ).toBe('provision_failed');
  });

  it('maps generic errors to provision_failed', () => {
    expect(mapOidcProvisionFailure(new Error('boom'))).toBe('provision_failed');
  });
});
