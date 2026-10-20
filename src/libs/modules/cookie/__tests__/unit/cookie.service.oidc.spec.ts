import { CookieService } from '@/libs/modules/cookie/cookie.service';
import type { AppConfigService } from '@/libs/modules/app-config/app-config.service';
import type { CookieOptions, Response } from 'express';

type CookieCall = [string, string, CookieOptions];
type ClearCall = [string, CookieOptions];

const IDENTITY_KEYS = [
  'httpOnly',
  'secure',
  'sameSite',
  'domain',
  'path',
] as const;

function identitySlice(options: CookieOptions): Record<string, unknown> {
  return Object.fromEntries(
    IDENTITY_KEYS.map((key) => [key, options[key]]),
  );
}

function createMockRes() {
  const cookieCalls: CookieCall[] = [];
  const clearCalls: ClearCall[] = [];
  const res = {
    cookie: jest.fn((name: string, value: string, options: CookieOptions) => {
      cookieCalls.push([name, value, options]);
    }),
    clearCookie: jest.fn((name: string, options: CookieOptions) => {
      clearCalls.push([name, options]);
    }),
  };
  return { res: res as unknown as Response, cookieCalls, clearCalls };
}

function createService(
  overrides: Partial<{ cookieDomain: string; nodeEnv: string }> = {},
): CookieService {
  const config = {
    cookieDomain: overrides.cookieDomain ?? 'localhost',
    nodeEnv: overrides.nodeEnv ?? 'development',
    sessionMaxAge: 86_400_000,
  };
  return new CookieService(config as unknown as AppConfigService);
}

function findCookie(
  calls: CookieCall[],
  name: string,
): CookieOptions | undefined {
  return calls.find(([n]) => n === name)?.[2];
}

function findClear(calls: ClearCall[], name: string): CookieOptions | undefined {
  return calls.find(([n]) => n === name)?.[1];
}

describe('CookieService OIDC set/clear parity', () => {
  it('clears session cookies with the same identity options used on set (development)', () => {
    const service = createService({
      cookieDomain: 'localhost',
      nodeEnv: 'development',
    });
    const { res, cookieCalls, clearCalls } = createMockRes();

    service.setOidcSessionCookies(res, {
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 900,
    });
    service.clearOidcSessionCookies(res);

    for (const name of ['bfAccessToken', 'bfRefreshToken'] as const) {
      const setOpts = findCookie(cookieCalls, name);
      const clearOpts = findClear(clearCalls, name);
      expect(setOpts).toBeDefined();
      expect(clearOpts).toBeDefined();
      expect(identitySlice(clearOpts!)).toEqual(identitySlice(setOpts!));
    }

    const xsrfSet = findCookie(cookieCalls, 'bf-xsrf-token');
    const xsrfClear = findClear(clearCalls, 'bf-xsrf-token');
    expect(xsrfSet).toBeDefined();
    expect(xsrfClear).toBeDefined();
    expect(identitySlice(xsrfClear!)).toEqual(identitySlice(xsrfSet!));
  });

  it('uses Secure + SameSite=None in production for set and clear', () => {
    const service = createService({
      cookieDomain: 'example.com',
      nodeEnv: 'production',
    });
    const { res, cookieCalls, clearCalls } = createMockRes();

    service.setOidcSessionCookies(res, {
      access_token: 'access',
      refresh_token: 'refresh',
    });
    service.clearOidcSessionCookies(res);

    const setOpts = findCookie(cookieCalls, 'bfAccessToken')!;
    const clearOpts = findClear(clearCalls, 'bfAccessToken')!;
    expect(setOpts.secure).toBe(true);
    expect(setOpts.sameSite).toBe('none');
    expect(setOpts.domain).toBe('example.com');
    expect(identitySlice(clearOpts)).toEqual(identitySlice(setOpts));
  });

  it('clears PKCE cookies with the same identity options used on set', () => {
    const service = createService({ cookieDomain: 'localhost' });
    const { res, cookieCalls, clearCalls } = createMockRes();

    service.setOidcPkceCookies(res, {
      verifier: 'v',
      state: 's',
      nonce: 'n',
      returnTo: '/app',
      maxAgeMs: 60_000,
    });
    service.clearOidcPkceCookies(res);

    for (const name of [
      'bfOidcVerifier',
      'bfOidcState',
      'bfOidcNonce',
      'bfOidcReturnTo',
    ] as const) {
      const setOpts = findCookie(cookieCalls, name);
      const clearOpts = findClear(clearCalls, name);
      expect(setOpts).toBeDefined();
      expect(clearOpts).toBeDefined();
      expect(identitySlice(clearOpts!)).toEqual(identitySlice(setOpts!));
    }
  });

  it('omits domain on set and clear when COOKIE_DOMAIN is empty', () => {
    const service = createService({ cookieDomain: '' });
    const { res, cookieCalls, clearCalls } = createMockRes();

    service.setOidcSessionCookies(res, {
      access_token: 'access',
      refresh_token: 'refresh',
    });
    service.clearOidcSessionCookies(res);

    const setOpts = findCookie(cookieCalls, 'bfAccessToken')!;
    const clearOpts = findClear(clearCalls, 'bfAccessToken')!;
    expect(setOpts.domain).toBeUndefined();
    expect(clearOpts.domain).toBeUndefined();
    expect(identitySlice(clearOpts)).toEqual(identitySlice(setOpts));
  });
});
