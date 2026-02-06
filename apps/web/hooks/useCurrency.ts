'use client';

import { Currency } from '@repo/database/client';
import { useLocalizationStore } from '../stores/localization-store';

interface UseCurrencyReturn {
  currency: Currency;
}

/**
 * Client-side hook for currency (derived from locale)
 * Currency is read-only - changes automatically when locale changes
 *
 * @example
 * ```tsx
 * function PriceDisplay({ amount }: { amount: number }) {
 *   const { currency } = useCurrency();
 *
 *   return <div>{amount} {currency}</div>;
 * }
 * ```
 */
export function useCurrency(): UseCurrencyReturn {
  const currency = useLocalizationStore((state) => state.currency);

  return { currency };
}
