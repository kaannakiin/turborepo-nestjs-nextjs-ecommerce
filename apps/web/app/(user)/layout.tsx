import { ReactNode, Suspense } from 'react';
import { getSession } from '../../lib/auth';
import UserAppShellLayout from '../components/UserAppShellLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { getStoreConfig } from '@lib/store-config';
import { getQueryClient } from '@lib/serverQueryClient';
import { dehydrate, HydrationBoundary } from '@repo/shared';
import { getCartData } from '@lib/cart-prefetch';
import { DataKeys } from '@lib/data-keys';
import { getServerLocalizationContext } from '@lib/locale-server';
import LocalizationStoreInitializer from './LocalizationStoreInitializer';

const UserLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();
  const storeConfig = await getStoreConfig();
  const localizationContext = await getServerLocalizationContext();

  const cartData = await getCartData();

  const queryClient = getQueryClient();

  if (cartData) {
    queryClient.setQueryData(DataKeys.cart.get, cartData);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LocalizationStoreInitializer
        locale={localizationContext.locale}
        currency={localizationContext.currency}
        storeType={localizationContext.storeType}
      />
      <UserAppShellLayout session={session}>
        <Suspense fallback={<LoadingOverlay />}>{children}</Suspense>
      </UserAppShellLayout>
    </HydrationBoundary>
  );
};

export default UserLayout;
