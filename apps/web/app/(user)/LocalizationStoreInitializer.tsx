'use client';

import { useEffect } from 'react';
import { Currency, Locale, StoreType } from '@repo/database/client';
import { useLocalizationStore } from '../../stores/localization-store';

interface LocalizationStoreInitializerProps {
  locale: Locale;
  currency: Currency;
  storeType: StoreType;
}

export default function LocalizationStoreInitializer({
  locale,
  currency,
  storeType,
}: LocalizationStoreInitializerProps) {
  const initialize = useLocalizationStore((state) => state.initialize);
  const isInitialized = useLocalizationStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize({ locale, currency, storeType });
    }
  }, [initialize, isInitialized, locale, currency, storeType]);

  return null;
}
