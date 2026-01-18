'use client';

import PriceFormatter from '@/(user)/components/PriceFormatter';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useTheme } from '@/context/theme-context/ThemeContext';
import { Button, Grid, Text } from '@mantine/core';
import { useProductDetail } from '@hooks/useStoreProducts';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useVariantSelection } from '../../../../hooks/useVariantSelection';
import VariantSelector from './VariantSelector';
import { IconHeart } from '@tabler/icons-react';
import AddCartButton from '@/components/AddCartButton';

const DesktopAssetViewer = dynamic(() => import('./DesktopAssetViewer'), {
  ssr: false,
  loading: () => <LoadingOverlay />,
});

const MobileAssetViewer = dynamic(() => import('./MobileAssetViewer'), {
  ssr: false,
  loading: () => <LoadingOverlay />,
});

interface ProductPageClientProps {
  slug: string;
}

const ProductPageClient = ({ slug }: ProductPageClientProps) => {
  const { actualMedia } = useTheme();
  const isMobile = actualMedia === 'mobile';

  const { data: product } = useProductDetail(slug);

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
                    <Text c={'primay'}>%{discountPercentage} İndirim</Text>
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

            <AddCartButton
              itemId={selectedVariant?.id}
              whereAdded="PRODUCT_PAGE"
              quantity={1}
              size="xl"
              radius={'xl'}
            />

            <Button
              fullWidth
              size="xl"
              radius={'xl'}
              variant="outline"
              justify="center"
              rightSection={<IconHeart />}
            >
              Favori
            </Button>

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
