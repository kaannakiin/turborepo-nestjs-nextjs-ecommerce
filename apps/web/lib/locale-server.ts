import { cookies } from 'next/headers';
import { Currency, Locale, StoreType } from '@repo/database/client';
import {
  LOCALE_COOKIE_NAME,
  STORE_TYPE_COOKIE_NAME,
  StoreZodOutputType,
} from '@repo/types';
import { getStoreConfig } from './store-config';

export function parseLocaleFromCookie(
  value: string | undefined,
): Locale | null {
  if (!value) return null;
  const upperValue = value.toUpperCase();
  if (Object.values(Locale).includes(upperValue as Locale)) {
    return upperValue as Locale;
  }
  return null;
}

export function parseStoreTypeFromCookie(
  value: string | undefined,
): StoreType | null {
  if (!value) return null;
  const upperValue = value.toUpperCase();
  if (Object.values(StoreType).includes(upperValue as StoreType)) {
    return upperValue as StoreType;
  }
  return null;
}

export function getCurrencyForLocale(
  locale: Locale,
  storeType: StoreType,
  storeConfig: StoreZodOutputType | null,
): Currency {
  if (!storeConfig) {
    return Currency.TRY;
  }

  const localeCurrencies =
    storeType === StoreType.B2B
      ? storeConfig.b2bLocaleCurrencies
      : storeConfig.b2cLocaleCurrencies;

  const match = localeCurrencies?.find(
    (lc) => lc.locale.toUpperCase() === locale,
  );

  return (match?.currency as Currency) || Currency.TRY;
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return parseLocaleFromCookie(localeCookie) || Locale.TR;
}

export async function getServerStoreType(): Promise<StoreType> {
  const cookieStore = await cookies();
  const storeTypeCookie = cookieStore.get(STORE_TYPE_COOKIE_NAME)?.value;
  return parseStoreTypeFromCookie(storeTypeCookie) || StoreType.B2C;
}

export async function getServerCurrency(): Promise<Currency> {
  const locale = await getServerLocale();
  const storeType = await getServerStoreType();
  const storeConfig = await getStoreConfig();

  return getCurrencyForLocale(locale, storeType, storeConfig);
}

export async function getServerLocalizationContext() {
  const locale = await getServerLocale();
  const storeType = await getServerStoreType();
  const currency = await getServerCurrency();

  return { locale, storeType, currency };
}
