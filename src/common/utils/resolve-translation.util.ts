type Translation = { locale: string; name: string; description?: string | null };

export function resolveTranslation(translations: Translation[], locale: string) {
  if (!translations || translations.length === 0) return null;

  return (
    translations.find(t => t.locale === locale)  // 1. Requested locale
    ?? translations.find(t => t.locale === 'en') // 2. English fallback
    ?? translations[0]                           // 3. Any available (last resort)
    ?? null
  );
}
