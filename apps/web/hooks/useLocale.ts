'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import { Locale } from '@repo/database/client';
import { LOCALE_COOKIE_NAME } from '@repo/types';
import { useLocalizationStore } from '../stores/localization-store';

interface UseLocaleReturn {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  isChanging: boolean;
  error: string | null;
}

/**
 * Client-side hook for locale management
 *
 * @example
 * ```tsx
 * function LanguageSelector() {
 *   const { locale, setLocale, isChanging } = useLocale();
 *
 *   return (
 *     <select
 *       value={locale}
 *       onChange={(e) => setLocale(e.target.value as Locale)}
 *       disabled={isChanging}
 *     >
 *       <option value="TR">Türkçe</option>
 *       <option value="EN">English</option>
 *     </select>
 *   );
 * }
 * ```
 */
export function useLocale(): UseLocaleReturn {
  const locale = useLocalizationStore((state) => state.locale);
  const storeSetLocale = useLocalizationStore((state) => state.setLocale);
  const isInitialized = useLocalizationStore((state) => state.isInitialized);

  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from cookie on mount
  useEffect(() => {
    if (!isInitialized) {
      const cookieLocale = getCookie(LOCALE_COOKIE_NAME);
      if (
        cookieLocale &&
        Object.values(Locale).includes(
          cookieLocale.toString().toUpperCase() as Locale,
        )
      ) {
        storeSetLocale(cookieLocale.toString().toUpperCase() as Locale);
      }
    }
  }, [isInitialized, storeSetLocale]);

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      if (!Object.values(Locale).includes(newLocale)) {
        setError(`Invalid locale: ${newLocale}`);
        return;
      }

      setIsChanging(true);
      setError(null);

      try {
        // 1. Update cookie via API endpoint
        const response = await fetch('/api/locale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: newLocale }),
        });

        if (!response.ok) {
          throw new Error('Failed to update locale');
        }

        // 2. Update client-side cookie (immediate reads)
        setCookie(LOCALE_COOKIE_NAME, newLocale, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });

        // 3. Update Zustand store
        storeSetLocale(newLocale);

        // 4. Reload page
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsChanging(false);
      }
    },
    [storeSetLocale],
  );

  return { locale, setLocale, isChanging, error };
}
