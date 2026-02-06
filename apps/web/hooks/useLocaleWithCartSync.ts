'use client';

import { useCallback, useState } from 'react';
import { Locale, Currency } from '@repo/database/client';
import { useLocale } from './useLocale';
import { useCurrency } from './useCurrency';

interface UseLocaleWithCartSyncReturn {
  locale: Locale;
  currency: Currency;
  changeLocale: (newLocale: Locale, newCurrency: Currency) => Promise<void>;
  isChanging: boolean;
  error: string | null;
}

/**
 * Advanced hook that combines locale change with cart synchronization
 * Use this when you need to update locale AND ensure cart items remain valid
 *
 * @example
 * ```tsx
 * function LocaleSwitcher() {
 *   const { locale, currency, changeLocale, isChanging } = useLocaleWithCartSync();
 *
 *   const handleChange = async (newLocale: Locale, newCurrency: Currency) => {
 *     await changeLocale(newLocale, newCurrency);
 *   };
 *
 *   return <LanguageSelector onChange={handleChange} />;
 * }
 * ```
 */
export function useLocaleWithCartSync(): UseLocaleWithCartSyncReturn {
  const {
    locale,
    setLocale,
    isChanging: isLocaleChanging,
    error: localeError,
  } = useLocale();
  const { currency } = useCurrency();

  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeLocale = useCallback(
    async (newLocale: Locale, newCurrency: Currency): Promise<void> => {
      setIsChanging(true);
      setError(null);

      try {
        // 1. Update locale cookie
        await setLocale(newLocale);

        // 2. Update cart context
        const response = await fetch('/cart/update-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: newLocale, currency: newCurrency }),
        });

        if (!response.ok) {
          throw new Error('Failed to update cart context');
        }

        // Note: setLocale already reloads the page
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to change locale';
        setError(errorMsg);
        console.error('Error changing locale with cart sync:', err);
      } finally {
        setIsChanging(false);
      }
    },
    [setLocale],
  );

  return {
    locale,
    currency,
    changeLocale,
    isChanging: isChanging || isLocaleChanging,
    error: error || localeError,
  };
}
