import {
  envSchema,
  isLoopbackUrl,
  OIDC_PRODUCTION_NON_LOOPBACK_KEYS,
  OIDC_PRODUCTION_REQUIRED_KEYS,
} from '@/_config/env.schema';

const baseEnv = {
  NODE_ENV: 'development' as const,
  PORT: '3005',
  APP_NAME: 'byte-forge-auth',
  FRONTEND_URL: 'http://localhost:3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USER: 'user',
  DB_PASSWORD: 'password-password-password',
  DB_NAME: 'bf',
  COMPOSE_PROJECT_NAME: 'bf',
  APP_EXTERNAL_PORT: '3005',
  DB_EXTERNAL_PORT: '5432',
  SALT_ROUNDS: '10',
  MAIL_PROVIDER: 'console' as const,
  MAIL_HOST: 'localhost',
  MAIL_PORT: '25',
  MAIL_SECURE: 'false',
  MAIL_FROM_NAME: 'Byte Forge',
  MAIL_FROM_EMAIL: 'noreply@example.com',
  CLOUDINARY_CLOUD_NAME: 'cloud',
  CLOUDINARY_API_KEY: 'key',
  CLOUDINARY_API_SECRET: 'secret',
  SESSION_MAX_AGE: '86400',
  COOKIE_DOMAIN: 'localhost',
  JWT_ADMIN_ACCESS_SECRET: 'a'.repeat(32),
  JWT_ADMIN_ACCESS_EXP: '15m',
  JWT_ADMIN_REFRESH_SECRET: 'b'.repeat(32),
  JWT_ADMIN_REFRESH_EXP: '7d',
  ADMIN_REGISTRATION_OTP_EMAIL: 'admin@example.com',
};

const productionOidc = {
  OIDC_ISSUER: 'https://auth.example.com',
  OIDC_DEFAULT_RESOURCE: 'https://api.example.com',
  OIDC_CLIENT_ID: 'byte-forge-web',
  OIDC_REDIRECT_URI: 'https://api.example.com/api/v1/user/auth/oidc/callback',
  OIDC_POST_LOGOUT_REDIRECT_URI: 'https://shop.example.com/',
};

describe('isLoopbackUrl', () => {
  it('detects localhost and 127.0.0.1', () => {
    expect(isLoopbackUrl('http://localhost:3010')).toBe(true);
    expect(isLoopbackUrl('http://127.0.0.1:3005/path')).toBe(true);
    expect(isLoopbackUrl('http://[::1]/')).toBe(true);
  });

  it('allows public hosts', () => {
    expect(isLoopbackUrl('https://auth.example.com')).toBe(false);
  });
});

describe('envSchema OIDC', () => {
  it('applies localhost OIDC defaults outside production', () => {
    const parsed = envSchema.parse(baseEnv);
    expect(parsed.OIDC_ISSUER).toBe('http://localhost:3010');
    expect(parsed.OIDC_CLIENT_ID).toBe('byte-forge-web');
    expect(parsed.OIDC_HTTP_TIMEOUT_MS).toBe(10_000);
  });

  it('trims COOKIE_DOMAIN', () => {
    const parsed = envSchema.parse({
      ...baseEnv,
      COOKIE_DOMAIN: '  localhost  ',
    });
    expect(parsed.COOKIE_DOMAIN).toBe('localhost');
  });

  it('allows empty COOKIE_DOMAIN outside production', () => {
    const parsed = envSchema.parse({
      ...baseEnv,
      COOKIE_DOMAIN: '',
    });
    expect(parsed.COOKIE_DOMAIN).toBe('');
  });

  it('requires OIDC vars in production', () => {
    const parsed = envSchema.safeParse({
      ...baseEnv,
      NODE_ENV: 'production',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const paths = parsed.error.issues.map((issue) => issue.path[0]);
    for (const key of OIDC_PRODUCTION_REQUIRED_KEYS) {
      expect(paths).toContain(key);
    }
  });

  it('rejects blank COOKIE_DOMAIN in production', () => {
    const parsed = envSchema.safeParse({
      ...baseEnv,
      NODE_ENV: 'production',
      COOKIE_DOMAIN: '   ',
      ...productionOidc,
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    expect(parsed.error.issues.map((issue) => issue.path[0])).toContain(
      'COOKIE_DOMAIN',
    );
  });

  it('rejects loopback OIDC URLs in production', () => {
    const parsed = envSchema.safeParse({
      ...baseEnv,
      NODE_ENV: 'production',
      COOKIE_DOMAIN: 'example.com',
      OIDC_ISSUER: 'http://localhost:3010',
      OIDC_DEFAULT_RESOURCE: 'http://127.0.0.1:3005',
      OIDC_CLIENT_ID: 'byte-forge-web',
      OIDC_REDIRECT_URI:
        'http://localhost:3005/api/v1/user/auth/oidc/callback',
      OIDC_POST_LOGOUT_REDIRECT_URI: 'http://localhost:3000/',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const paths = parsed.error.issues.map((issue) => issue.path[0]);
    for (const key of OIDC_PRODUCTION_NON_LOOPBACK_KEYS) {
      expect(paths).toContain(key);
    }
  });

  it('accepts explicit non-loopback OIDC vars in production', () => {
    const parsed = envSchema.parse({
      ...baseEnv,
      NODE_ENV: 'production',
      COOKIE_DOMAIN: 'example.com',
      ALLOWED_ORIGINS: 'https://shop.example.com',
      ...productionOidc,
    });

    expect(parsed.OIDC_ISSUER).toBe('https://auth.example.com');
    expect(parsed.COOKIE_DOMAIN).toBe('example.com');
    expect(parsed.ALLOWED_ORIGINS).toBe('https://shop.example.com');
  });

  it('requires ALLOWED_ORIGINS in production', () => {
    const parsed = envSchema.safeParse({
      ...baseEnv,
      NODE_ENV: 'production',
      COOKIE_DOMAIN: 'example.com',
      ...productionOidc,
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    expect(parsed.error.issues.map((issue) => issue.path[0])).toContain(
      'ALLOWED_ORIGINS',
    );
  });

  it('rejects invalid ALLOWED_ORIGINS tokens', () => {
    const parsed = envSchema.safeParse({
      ...baseEnv,
      ALLOWED_ORIGINS: 'not-a-url,http://localhost:3000',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    expect(parsed.error.issues.map((issue) => issue.path[0])).toContain(
      'ALLOWED_ORIGINS',
    );
  });

  it('allows unset ALLOWED_ORIGINS outside production', () => {
    const parsed = envSchema.parse(baseEnv);
    expect(parsed.ALLOWED_ORIGINS).toBeUndefined();
  });
});
