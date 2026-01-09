import { ComboboxItem, ComboboxParsedItem } from '@mantine/core';
import { Currency, Locale } from '@repo/database/client';
import { RESERVED_KEYS_CONFIGS, ReservedKeysType } from '@repo/shared';
import { AdminProductTableProductData, UiProductType } from '@repo/types';

type Product = UiProductType;
type Variant = Product['variants'][number];

export interface SwatchOption {
  optionId: string;
  name: string;
  slug: string;
  hexValue: string | null;
  optionAssetUrl: string | undefined;
  variantImageUrl: string | undefined;
}

export interface PrimaryVariantGroup {
  groupName: string;
  groupSlug: string;
  groupType: string;
  renderType: string;
  swatchType: 'color' | 'image' | null;
  optionCount: number;
  options: SwatchOption[];
}

export function getServerSideAllSearchParams(
  searchParams: Record<string, string | string[]>,
  excludeKeys: ReservedKeysType[] = [],
): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    const originalKey = getOriginalKeyFromParam(key);

    if (originalKey && excludeKeys.includes(originalKey)) {
      return;
    }

    if (Array.isArray(value)) {
      params.set(key, value.join(','));
    } else {
      params.set(key, value);
    }
  });

  return params.toString();
}

function getOriginalKeyFromParam(paramKey: string): ReservedKeysType | null {
  const entry = Object.entries(RESERVED_KEYS_CONFIGS).find(
    ([_, config]) => config.paramKey === paramKey,
  );
  return entry ? (entry[0] as ReservedKeysType) : null;
}

export const getOgImageUrl = (url: string): string => {
  const lastDotIndex = url.lastIndexOf('.');
  if (lastDotIndex === -1) return url;

  const basePath = url.substring(0, lastDotIndex);
  return `${basePath}-og.jpg`;
};

export const getThumbnailUrl = (url: string): string => {
  const lastDotIndex = url.lastIndexOf('.');
  if (lastDotIndex === -1) return url;

  const basePath = url.substring(0, lastDotIndex);
  return `${basePath}-thumbnail.webp`;
};

type ProductStatus = 'active' | 'passive' | 'partial';

export const getProductStatus = (
  product: AdminProductTableProductData,
): ProductStatus => {
  if (!product?.active) {
    return 'passive';
  }

  const variants = product?.variants ?? [];

  if (variants.length === 0) {
    return product.active ? 'active' : 'passive';
  }

  const activeVariants = variants.filter((v) => v.active);

  if (activeVariants.length === variants.length) {
    return 'active';
  }

  if (activeVariants.length === 0) {
    return 'passive';
  }

  return 'partial';
};

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

export const getStockRange = (product: AdminProductTableProductData) => {
  const stocks = product.variants.map((v) => v.stock);

  if (stocks.length === 0) return { min: 0, max: 0, display: '0' };

  const min = Math.min(...stocks);
  const max = Math.max(...stocks);

  return {
    min,
    max,
    display: min === max ? String(min) : `${min} - ${max}`,
  };
};

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
export const normalizeTurkish = (str: string): string => {
  const turkishMap: Record<string, string> = {
    İ: 'i',
    I: 'i',
    ı: 'i',
    Ğ: 'g',
    ğ: 'g',
    Ü: 'u',
    ü: 'u',
    Ş: 's',
    ş: 's',
    Ö: 'o',
    ö: 'o',
    Ç: 'c',
    ç: 'c',
  };

  return str
    .split('')
    .map((char) => turkishMap[char] ?? char.toLowerCase())
    .join('');
};

interface FilterOptions {
  options: ComboboxParsedItem[];
  search: string;
}

export const turkishSelectFilter = ({
  options,
  search,
}: FilterOptions): ComboboxItem[] => {
  const searchNormalized = normalizeTurkish(search.trim());

  if (!searchNormalized) {
    return options.filter(
      (option): option is ComboboxItem => 'value' in option,
    );
  }

  return options.filter((option): option is ComboboxItem => {
    if (!('value' in option)) return false;
    const labelNormalized = normalizeTurkish(option.label ?? '');
    return labelNormalized.includes(searchNormalized);
  });
};

/**
 * Ürünün birincil varyant grubunu ve swatch bilgilerini döndürür.
 * variantGroups.options zaten backend'de stock > 0 ve active: true ile filtrelenmiş geliyor.
 */
export const getPrimaryVariantGroup = (
  product: Product,
): PrimaryVariantGroup | null => {
  if (product.visibleAllCombinations) return null;

  const primaryGroup = product.variantGroups?.[0];
  if (!primaryGroup) return null;

  const groupType = primaryGroup.variantGroup.type;
  const renderType = primaryGroup.renderVisibleType;
  const groupSlug = primaryGroup.variantGroup.translations?.[0]?.slug || '';

  const options: SwatchOption[] = primaryGroup.options.map((opt) => {
    const firstCombinationAsset =
      opt.combinations?.[0]?.combination?.assets?.[0]?.asset?.url;

    return {
      optionId: opt.variantOption.id,
      name: opt.variantOption.translations?.[0]?.name || '',
      slug: opt.variantOption.translations?.[0]?.slug || '',
      hexValue: opt.variantOption.hexValue,
      optionAssetUrl: opt.variantOption.asset?.url,
      variantImageUrl: firstCombinationAsset || product.assets?.[0]?.asset?.url,
    };
  });

  if (options.length === 0) return null;

  const hasHexValues = options.some((opt) => opt.hexValue);
  const hasOptionAssets = options.some((opt) => opt.optionAssetUrl);

  let swatchType: 'color' | 'image' | null = null;

  if (groupType === 'COLOR') {
    if (hasHexValues) {
      swatchType = 'color';
    } else if (hasOptionAssets) {
      swatchType = 'image';
    }
  } else if (groupType === 'LIST') {
    if (renderType !== 'DROPDOWN' && hasOptionAssets) {
      swatchType = 'image';
    }
  }

  return {
    groupName: primaryGroup.variantGroup.translations?.[0]?.name || '',
    groupSlug,
    groupType,
    renderType,
    swatchType,
    optionCount: options.length,
    options,
  };
};

/**
 * visibleAllCombinations true olduğunda mevcut varyantın opsiyon text'ini döndürür
 */
export const getCurrentVariantOptionText = (
  product: Product,
  variant: Variant,
): string | null => {
  if (!product.visibleAllCombinations) return null;

  const options = variant.options || [];
  if (options.length === 0) return null;

  return options
    .map(
      (opt) =>
        opt.productVariantOption.variantOption.translations?.[0]?.name || '',
    )
    .filter(Boolean)
    .join(' / ');
};

/**
 * Hover durumuna göre gösterilecek ana resmi döndürür
 */
export const getDisplayImage = (
  product: Product,
  variant: Variant,
  primaryGroup: PrimaryVariantGroup | null,
  hoveredOptionIndex: number | null,
): string | undefined => {
  if (hoveredOptionIndex !== null && primaryGroup) {
    const hoveredOption = primaryGroup.options[hoveredOptionIndex];

    if (hoveredOption?.variantImageUrl) {
      return hoveredOption.variantImageUrl;
    }
  }

  return variant.assets?.[0]?.asset?.url || product.assets?.[0]?.asset?.url;
};

/**
 * Swatch'ların gösterilip gösterilmeyeceğini belirler
 */
export const shouldShowSwatches = (
  primaryGroup: PrimaryVariantGroup | null,
): boolean => {
  if (!primaryGroup) return false;

  if (!primaryGroup.swatchType) return false;

  if (primaryGroup.options.length <= 1) return false;

  return true;
};

/**
 * Fiyat bilgilerini hesaplar
 */
export const calculatePriceInfo = (variant: Variant) => {
  const price = variant.prices?.[0];
  const originalPrice = price?.price || 0;
  const discountedPrice = price?.discountedPrice;
  const hasDiscount = discountedPrice && discountedPrice < originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;
  const displayPrice = discountedPrice || originalPrice;
  const currency = price?.currency || 'TRY';

  return {
    originalPrice,
    discountedPrice,
    hasDiscount,
    discountPercentage,
    displayPrice,
    currency,
  };
};

/**
 * Ürün detay sayfasına yönlendirme URL parametrelerini oluşturur
 */
export const buildVariantUrlParams = (variant: Variant): URLSearchParams => {
  const params = new URLSearchParams();

  variant.options?.forEach((opt) => {
    const groupSlug =
      opt.productVariantOption.variantOption.variantGroup?.translations?.[0]
        ?.slug;
    const optionSlug =
      opt.productVariantOption.variantOption.translations?.[0]?.slug;

    if (groupSlug && optionSlug) {
      params.set(groupSlug, optionSlug);
    }
  });

  return params;
};

/**
 * Swatch tıklandığında yönlendirme URL parametrelerini oluşturur
 */
export const buildSwatchUrlParams = (
  primaryGroup: PrimaryVariantGroup,
  optionSlug: string,
): URLSearchParams => {
  const params = new URLSearchParams();
  params.set(primaryGroup.groupSlug, optionSlug);
  return params;
};
