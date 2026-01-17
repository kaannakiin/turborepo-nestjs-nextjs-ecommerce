import { Locale } from '@repo/database';
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { type Messages } from 'next-intl';
import { LOCALE_COOKIE_NAME } from '@repo/types';

const DEFAULT_LOCALE: Locale = 'TR';

const LOCALE_TIMEZONE: Record<Locale, string> = {
  TR: 'Europe/Istanbul',
  EN: 'Europe/London',
  DE: 'Europe/Berlin',
};

export default getRequestConfig(async () => {
  const cookieStore = await cookies();

  const cookieLocale = cookieStore
    .get(LOCALE_COOKIE_NAME)
    ?.value?.toUpperCase();

  let locale: Locale = DEFAULT_LOCALE;
  if (cookieLocale && Object.keys(Locale).includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  }

  let messages: Messages = {};
  try {
    messages = (await import(`./messages/${locale.toLowerCase()}.json`))
      .default;
  } catch {
    messages = (await import(`./messages/${DEFAULT_LOCALE.toLowerCase()}.json`))
      .default;
  }

  return {
    locale,
    messages,
    timeZone: LOCALE_TIMEZONE[locale] || 'Europe/Istanbul',
  };
});
