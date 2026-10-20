/**
 * Browser origins allowed for CORS and CSRF Origin/Referer checks.
 * Prefer `ALLOWED_ORIGINS` env (comma-separated). Non-prod falls back to these defaults.
 */
export const DEFAULT_DEV_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3050',
] as const;

/** Parse comma-separated absolute origins; stores each as `URL.origin`. Throws on junk. */
export function parseAllowedOrigins(raw?: string): string[] {
  if (raw == null || !raw.trim()) {
    return [];
  }

  const origins: string[] = [];
  for (const token of raw.split(',')) {
    const trimmed = token.trim();
    if (!trimmed) {
      continue;
    }
    try {
      origins.push(new URL(trimmed).origin);
    } catch {
      throw new Error(`Invalid ALLOWED_ORIGINS entry: ${trimmed}`);
    }
  }

  return [...new Set(origins)];
}

/**
 * Resolve the effective allowlist: env list when set; otherwise dev defaults.
 * Production must set a non-empty `ALLOWED_ORIGINS` (schema gates boot; this throws as defense).
 */
export function resolveAllowedOrigins(
  raw: string | undefined,
  nodeEnv: string,
): string[] {
  const parsed = parseAllowedOrigins(raw);
  if (parsed.length > 0) {
    return parsed;
  }
  if (nodeEnv === 'production') {
    throw new Error(
      'ALLOWED_ORIGINS is required when NODE_ENV=production (comma-separated absolute origins)',
    );
  }
  return [...DEFAULT_DEV_ALLOWED_ORIGINS];
}
