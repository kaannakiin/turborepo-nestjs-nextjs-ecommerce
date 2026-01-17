import { ReactNode, Suspense } from 'react';
import { getSession } from '../../lib/auth';
import UserAppShellLayout from '../components/UserAppShellLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { LOCALE_COOKIE_NAME, STORE_TYPE_COOKIE_NAME } from '@repo/types';
import { cookies } from 'next/headers';
import { getStoreConfig } from '@lib/store-config';
import { Locale } from '@repo/database/client';
import { getQueryClient } from '@lib/serverQueryClient';
import { dehydrate, HydrationBoundary } from '@repo/shared';
import { getCartData } from '@lib/cart-prefetch';
import { DataKeys } from '@lib/data-keys';

const UserLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();
  const storeConfig = await getStoreConfig();
  const cookieStore = await cookies();

  const storeType =
    (cookieStore.get(STORE_TYPE_COOKIE_NAME)?.value as 'B2C' | 'B2B') || 'B2C';
  const isB2B = storeType === 'B2B';

  const localeCurrencies = isB2B
    ? storeConfig?.b2bLocaleCurrencies
    : storeConfig?.b2cLocaleCurrencies;

  const availableLocales = localeCurrencies?.map(
    (lc) => lc.locale.toUpperCase() as Locale,
  ) || ['TR' as Locale];

  const currentLocale =
    (cookieStore.get(LOCALE_COOKIE_NAME)?.value?.toUpperCase() as Locale) ||
    'TR';

  const cartData = await getCartData();

  const queryClient = getQueryClient();

  if (cartData) {
    queryClient.setQueryData(DataKeys.cart.get, cartData);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserAppShellLayout session={session}>
        <Suspense fallback={<LoadingOverlay />}>{children}</Suspense>
      </UserAppShellLayout>
    </HydrationBoundary>
  );
};

export default UserLayout;
