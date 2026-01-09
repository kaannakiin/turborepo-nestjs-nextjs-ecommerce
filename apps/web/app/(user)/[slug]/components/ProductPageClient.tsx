'use client';

import PriceFormatter from '@/(user)/components/PriceFormatter';
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay';
import { useTheme } from '@/context/theme-context/ThemeContext';
import fetchWrapper from '@lib/wrappers/fetchWrapper';
import { Grid, Text } from '@mantine/core';
import { useQuery } from '@repo/shared';
import { ProductDetailType } from '@repo/types';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useVariantSelection } from '../../../../hooks/useVariantSelection';
import VariantSelector from './VariantSelector';

const DesktopAssetViewer = dynamic(() => import('./DesktopAssetViewer'), {
  ssr: false,
  loading: () => <GlobalLoadingOverlay />,
});

const MobileAssetViewer = dynamic(() => import('./MobileAssetViewer'), {
  ssr: false,
  loading: () => <GlobalLoadingOverlay />,
});

interface ProductPageClientProps {
  slug: string;
}

const ProductPageClient = ({ slug }: ProductPageClientProps) => {
  const { actualMedia } = useTheme();
  const isMobile = actualMedia === 'mobile';

  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await fetchWrapper.get<ProductDetailType>(
        `/product/${slug}`,
      );
      if (!response.success) throw new Error('Ürün alınamadı');
      return response.data;
    },
  });

  const {
    selectedVariant,
    selectedSlugs,
    selectOption,
    isOptionSelected,
    isOptionSelectable,
    price,
    originalPrice,
    discountPercentage,
    isInStock,
  } = useVariantSelection({ product: product! });

  const assets = useMemo(() => {
    const variantAssets = selectedVariant?.assets ?? [];
    const productAssets = product?.assets ?? [];

    const allAssets = [...variantAssets, ...productAssets];

    return allAssets
      .sort((a, b) => a.order - b.order)
      .map((a) => ({
        url: a.asset.url,
        type: a.asset.type,
      }));
  }, [selectedVariant?.assets, product?.assets]);

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-[1500px] lg:mx-auto px-4 w-full">
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          {isMobile ? (
            <MobileAssetViewer
              assets={assets}
              key={selectedVariant?.id || 'key'}
            />
          ) : (
            <DesktopAssetViewer
              assets={assets}
              key={selectedVariant?.id || 'key'}
            />
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <div className="flex flex-col gap-4 lg:sticky lg:top-4">
            {product.brand && (
              <span className="text-sm text-gray-500">
                {product.brand.translations[0]?.name}
              </span>
            )}

            <h1 className="text-2xl font-medium">
              {product.translations[0]?.name}
            </h1>

            <div className="flex items-center gap-2">
              {originalPrice ? (
                <>
                  <PriceFormatter price={price!} size="xl" fw={600} />
                  <PriceFormatter
                    price={originalPrice}
                    size="md"
                    fw={400}
                    c="dimmed"
                    td="line-through"
                  />
                  {discountPercentage && (
                    <Text size="sm" c="red">
                      %{discountPercentage} İndirim
                    </Text>
                  )}
                </>
              ) : (
                <PriceFormatter price={price!} size="xl" fw={600} />
              )}
            </div>

            <VariantSelector
              variantGroups={product.variantGroups}
              selectedSlugs={selectedSlugs}
              onSelectOption={selectOption}
              isOptionSelected={isOptionSelected}
              isOptionSelectable={isOptionSelectable}
            />

            <button
              disabled={!isInStock}
              className={`
                w-full py-4 rounded-full font-medium mt-4 transition-colors
                ${
                  isInStock
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isInStock ? 'Sepete Ekle' : 'Stokta Yok'}
            </button>

            <button className="w-full border border-gray-300 py-4 rounded-full font-medium hover:border-gray-400 transition-colors">
              Favori ♡
            </button>

            {product.translations[0]?.description && (
              <p className="text-gray-600 mt-4 leading-relaxed">
                {product.translations[0].description}
              </p>
            )}
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default ProductPageClient;
