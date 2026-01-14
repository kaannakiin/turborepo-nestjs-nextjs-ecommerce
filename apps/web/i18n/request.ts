import { LOCALE_COOKIE_NAME } from '@lib/constants';
import { Locale } from '@repo/database';
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const DEFAULT_LOCALE: Locale = 'TR';

// Locale'e göre timezone mapping
const LOCALE_TIMEZONE: Record<Locale, string> = {
  TR: 'Europe/Istanbul',
  EN: 'Europe/London',
  DE: 'Europe/Berlin',
};

export default getRequestConfig(async () => {
  // Cookie'den locale oku (proxy.ts tarafından set edilmiş olmalı)
  const cookieStore = await cookies();
  const cookieLocale = cookieStore
    .get(LOCALE_COOKIE_NAME)
    ?.value?.toUpperCase();

  // Validate locale
  let locale: Locale = DEFAULT_LOCALE;
  if (cookieLocale && Object.keys(Locale).includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  }

  // Messages dosyasını yükle
  let messages;
  try {
    messages = (await import(`./messages/${locale.toLowerCase()}.json`))
      .default;
  } catch {
    // Fallback to default locale if message file not found
    messages = (await import(`./messages/${DEFAULT_LOCALE.toLowerCase()}.json`))
      .default;
  }

  return {
    locale,
    messages,
    timeZone: LOCALE_TIMEZONE[locale] || 'Europe/Istanbul',
  };
});
