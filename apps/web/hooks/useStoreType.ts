'use client';

import { useEffect, useCallback } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import { StoreType } from '@repo/database/client';
import { STORE_TYPE_COOKIE_NAME } from '@repo/types';
import { useLocalizationStore } from '../stores/localization-store';

interface UseStoreTypeReturn {
  storeType: StoreType;
  setStoreType: (storeType: StoreType) => void;
  isB2B: boolean;
  isB2C: boolean;
}

/**
 * Client-side hook for store type management (B2C/B2B)
 *
 * @example
 * ```tsx
 * function StoreTypeSwitch() {
 *   const { storeType, setStoreType, isB2B } = useStoreType();
 *
 *   return (
 *     <button onClick={() => setStoreType(isB2B ? StoreType.B2C : StoreType.B2B)}>
 *       {isB2B ? 'Switch to B2C' : 'Switch to B2B'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useStoreType(): UseStoreTypeReturn {
  const storeType = useLocalizationStore((state) => state.storeType);
  const storeSetStoreType = useLocalizationStore((state) => state.setStoreType);
  const isInitialized = useLocalizationStore((state) => state.isInitialized);

  // Initialize from cookie on mount
  useEffect(() => {
    if (!isInitialized) {
      const cookieStoreType = getCookie(STORE_TYPE_COOKIE_NAME);
      if (
        cookieStoreType &&
        Object.values(StoreType).includes(
          cookieStoreType.toString().toUpperCase() as StoreType,
        )
      ) {
        storeSetStoreType(cookieStoreType.toString().toUpperCase() as StoreType);
      }
    }
  }, [isInitialized, storeSetStoreType]);

  const setStoreType = useCallback(
    (newStoreType: StoreType) => {
      if (!Object.values(StoreType).includes(newStoreType)) {
        console.error(`Invalid store type: ${newStoreType}`);
        return;
      }

      // Update cookie
      setCookie(STORE_TYPE_COOKIE_NAME, newStoreType, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });

      // Update store
      storeSetStoreType(newStoreType);

      // Reload page to apply changes
      window.location.reload();
    },
    [storeSetStoreType],
  );

  return {
    storeType,
    setStoreType,
    isB2B: storeType === StoreType.B2B,
    isB2C: storeType === StoreType.B2C,
  };
}
