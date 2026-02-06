import type { AdminProductTableProductData } from '@repo/types';
import type { Currency, Locale } from '@repo/database/client';

/**
 * Get product asset (image) with fallback priority:
 * 1. Product-level asset
 * 2. Default variant asset
 * 3. First variant with images
 * 4. null
 */
export const getProductAsset = (product: AdminProductTableProductData) => {
  const defaultVariant = product.variants.find((v) => v.isDefault);
  const firstImageVariant = product.variants.find((v) => v.assets.length > 0);

  return (
    product.assets[0]?.asset ||
    defaultVariant?.assets[0]?.asset ||
    firstImageVariant?.assets[0]?.asset ||
    null
  );
};

/**
 * Get localized product name
 */
export const getProductName = (
  product: AdminProductTableProductData,
  locale: Locale = 'TR',
): string => {
  return (
    product.translations.find((t) => t.locale === locale)?.name ||
    product.translations[0]?.name ||
    'İsimsiz Ürün'
  );
};

/**
 * Get price range for product variants with locale-aware formatting
 * Uses Intl.NumberFormat for proper currency symbol and decimal placement
 */
export const getPriceRange = (
  product: AdminProductTableProductData,
  currency: Currency = 'TRY',
  locale: Locale = 'TR',
) => {
  const prices = product.variants
    .map((v) => v.prices.find((p) => p.currency === currency)?.price)
    .filter((p): p is number => p !== undefined && p !== null);

  if (prices.length === 0) {
    return { min: 0, max: 0, display: '-' };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const format = (val: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(val);

  return {
    min,
    max,
    display: min === max ? format(min) : `${format(min)} - ${format(max)}`,
  };
};
