// lib/ui/product-helper.ts
import { RESERVED_KEYS_CONFIGS, ReservedKeysType } from "@repo/shared";

export function getServerSideAllSearchParams(
  searchParams: Record<string, string | string[]>,
  excludeKeys: ReservedKeysType[] = []
): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    const originalKey = getOriginalKeyFromParam(key);

    if (originalKey && excludeKeys.includes(originalKey)) {
      return;
    }

    if (Array.isArray(value)) {
      params.set(key, value.join(","));
    } else {
      params.set(key, value);
    }
  });

  return params.toString();
}

function getOriginalKeyFromParam(paramKey: string): ReservedKeysType | null {
  const entry = Object.entries(RESERVED_KEYS_CONFIGS).find(
    ([_, config]) => config.paramKey === paramKey
  );
  return entry ? (entry[0] as ReservedKeysType) : null;
}

export const getOgImageUrl = (url: string): string => {
  const lastDotIndex = url.lastIndexOf(".");
  if (lastDotIndex === -1) return url;

  const basePath = url.substring(0, lastDotIndex);
  return `${basePath}-og.jpg`;
};

export const getThumbnailUrl = (url: string): string => {
  const lastDotIndex = url.lastIndexOf(".");
  if (lastDotIndex === -1) return url;

  const basePath = url.substring(0, lastDotIndex);
  return `${basePath}-thumbnail.webp`;
};

// helpers/product-table.helpers.ts

import { Locale } from "@repo/database/client";
import { AdminProductTableProductData } from "@repo/types";
import { ComboboxItem, ComboboxParsedItem } from "@mantine/core";

type ProductStatus = "active" | "passive" | "partial";

export const getProductStatus = (
  product: AdminProductTableProductData
): ProductStatus => {
  if (!product?.active) {
    return "passive";
  }

  const variants = product?.variants ?? [];

  if (variants.length === 0) {
    return product.active ? "active" : "passive";
  }

  const activeVariants = variants.filter((v) => v.active);

  if (activeVariants.length === variants.length) {
    return "active";
  }

  if (activeVariants.length === 0) {
    return "passive";
  }

  return "partial";
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
  locale: Locale = "TR"
): string => {
  return (
    product.translations.find((t) => t.locale === locale)?.name ||
    product.translations[0]?.name ||
    "İsimsiz Ürün"
  );
};

export const getStockRange = (product: AdminProductTableProductData) => {
  const stocks = product.variants.map((v) => v.stock);

  if (stocks.length === 0) return { min: 0, max: 0, display: "0" };

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
  currency: string = "TRY",
  locale: Locale = "TR"
) => {
  const prices = product.variants
    .map((v) => v.prices.find((p) => p.currency === currency)?.price)
    .filter((p): p is number => p !== undefined && p !== null);

  if (prices.length === 0) {
    return { min: 0, max: 0, display: "-" };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const format = (val: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
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
    İ: "i",
    I: "i",
    ı: "i",
    Ğ: "g",
    ğ: "g",
    Ü: "u",
    ü: "u",
    Ş: "s",
    ş: "s",
    Ö: "o",
    ö: "o",
    Ç: "c",
    ç: "c",
  };

  return str
    .split("")
    .map((char) => turkishMap[char] ?? char.toLowerCase())
    .join("");
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
      (option): option is ComboboxItem => "value" in option
    );
  }

  return options.filter((option): option is ComboboxItem => {
    if (!("value" in option)) return false;
    const labelNormalized = normalizeTurkish(option.label ?? "");
    return labelNormalized.includes(searchNormalized);
  });
};
