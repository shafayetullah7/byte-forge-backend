import {
  DEFAULT_DEV_ALLOWED_ORIGINS,
  parseAllowedOrigins,
  resolveAllowedOrigins,
} from '@/libs/security/allowed-origins';

describe('parseAllowedOrigins', () => {
  it('returns empty for unset or blank', () => {
    expect(parseAllowedOrigins(undefined)).toEqual([]);
    expect(parseAllowedOrigins('')).toEqual([]);
    expect(parseAllowedOrigins('   ')).toEqual([]);
  });

  it('parses comma-separated origins and normalizes to URL.origin', () => {
    expect(
      parseAllowedOrigins(
        'https://shop.example.com, http://localhost:3000/path',
      ),
    ).toEqual(['https://shop.example.com', 'http://localhost:3000']);
  });

  it('dedupes origins', () => {
    expect(
      parseAllowedOrigins(
        'http://localhost:3000,http://localhost:3000/',
      ),
    ).toEqual(['http://localhost:3000']);
  });

  it('throws on invalid entries', () => {
    expect(() => parseAllowedOrigins('not-a-url')).toThrow(
      /Invalid ALLOWED_ORIGINS entry/,
    );
  });
});

describe('resolveAllowedOrigins', () => {
  it('honors an explicit list', () => {
    expect(
      resolveAllowedOrigins('https://shop.example.com', 'development'),
    ).toEqual(['https://shop.example.com']);
  });

  it('falls back to dev defaults when unset outside production', () => {
    expect(resolveAllowedOrigins(undefined, 'development')).toEqual([
      ...DEFAULT_DEV_ALLOWED_ORIGINS,
    ]);
    expect(resolveAllowedOrigins('', 'test')).toEqual([
      ...DEFAULT_DEV_ALLOWED_ORIGINS,
    ]);
  });

  it('throws in production when list is empty', () => {
    expect(() => resolveAllowedOrigins(undefined, 'production')).toThrow(
      /ALLOWED_ORIGINS is required/,
    );
    expect(() => resolveAllowedOrigins('  ', 'production')).toThrow(
      /ALLOWED_ORIGINS is required/,
    );
  });
});
