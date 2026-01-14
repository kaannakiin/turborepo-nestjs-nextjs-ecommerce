import { StoreZodOutputType } from '@repo/types';
import fetchWrapper, { ApiError } from './wrappers/fetchWrapper';

const CACHE_TTL = 5 * 60 * 1000;
let storeConfigCache: {
  data: StoreZodOutputType | null;
  timestamp: number;
  fetchPromise?: Promise<StoreZodOutputType | null>;
} | null = null;

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

export async function getStoreConfig(): Promise<StoreZodOutputType | null> {
  const now = Date.now();

  if (storeConfigCache && now - storeConfigCache.timestamp < CACHE_TTL) {
    return storeConfigCache.data;
  }

  if (storeConfigCache?.fetchPromise) {
    return storeConfigCache.fetchPromise;
  }

  const fetchPromise = fetchStoreConfig();

  storeConfigCache = {
    data: storeConfigCache?.data ?? null,
    timestamp: storeConfigCache?.timestamp ?? 0,
    fetchPromise,
  };

  try {
    const data = await fetchPromise;

    storeConfigCache = {
      data,
      timestamp: now,
    };

    return data;
  } catch (error) {
    if (storeConfigCache) {
      storeConfigCache.fetchPromise = undefined;
    }
    throw error;
  }
}

export function invalidateStoreConfigCache(): void {
  storeConfigCache = null;
}
