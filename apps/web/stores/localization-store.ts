'use client';

import { create } from 'zustand';
import { Currency, Locale, StoreType } from '@repo/database/client';

interface LocalizationState {
  locale: Locale;
  currency: Currency;
  storeType: StoreType;
  isInitialized: boolean;
}

interface LocalizationActions {
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: Currency) => void;
  setStoreType: (storeType: StoreType) => void;
  initialize: (state: Omit<LocalizationState, 'isInitialized'>) => void;
}

export type LocalizationStore = LocalizationState & LocalizationActions;

export const useLocalizationStore = create<LocalizationStore>((set) => ({
  locale: Locale.TR,
  currency: Currency.TRY,
  storeType: StoreType.B2C,
  isInitialized: false,

  setLocale: (locale) => set({ locale }),
  setCurrency: (currency) => set({ currency }),
  setStoreType: (storeType) => set({ storeType }),
  initialize: (state) => set({ ...state, isInitialized: true }),
}));
