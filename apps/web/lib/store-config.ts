import { StoreZodOutputType } from '@repo/types';
import { unstable_cache } from 'next/cache';
import fetchWrapper, { ApiError } from './wrappers/fetchWrapper';

export const STORE_CONFIG_CACHE_TAG = 'store-config';

async function fetchStoreConfig(): Promise<StoreZodOutputType | null> {
  try {
    const res = await fetchWrapper.get<StoreZodOutputType>('/admin/store');
    if (!res.success) {
      console.error('Store config fetch failed:', res);
      const error = res as ApiError;
      throw new Error(error.error);
    }
    return res.data as StoreZodOutputType;
  } catch (error) {
    console.error('Store config fetch error:', error);
    return null;
  }
}

export const getStoreConfig = unstable_cache(
  async (): Promise<StoreZodOutputType | null> => {
    return fetchStoreConfig();
  },
  ['store-config'],
  {
    tags: [STORE_CONFIG_CACHE_TAG],
    revalidate: false, // Manuel invalidation - sadece tag ile
  },
);
