export const CATEGORY_PAGE_BRANDS_KEY_NAME = "brands";
export const CATEGORY_PAGE_PRODUCT_TAGS_KEY_NAME = "tags";
export const CATEGORY_PAGE_CATEGORIES_KEY_NAME = "categories";

export type ReservedKeysType =
  | "brands"
  | "tags"
  | "categories"
  | "sort"
  | "page"
  | "limit"
  | "minPrice"
  | "maxPrice";

export const RESERVED_KEYS_CONFIGS: Record<
  ReservedKeysType,
  { paramKey: string; displayName?: string }
> = {
  brands: { paramKey: "b", displayName: "Markalar" },
  tags: { paramKey: "t", displayName: "Etiketler" },
  categories: { paramKey: "c", displayName: "Kategoriler" },
  sort: { paramKey: "s", displayName: "Sıralama" },
  page: { paramKey: "p" },
  limit: { paramKey: "l" },
  minPrice: { paramKey: "mp", displayName: "Min Fiyat" },
  maxPrice: { paramKey: "xp", displayName: "Max Fiyat" },
};

export const RESERVED_KEYS = Object.keys(
  RESERVED_KEYS_CONFIGS
) as ReservedKeysType[];

export const isReservedKey = (key: string): boolean => {
  return RESERVED_KEYS.includes(key as ReservedKeysType);
};

export const isReservedParamKey = (key: string): boolean => {
  return Object.values(RESERVED_KEYS_CONFIGS).some(
    (config) => config.paramKey === key
  );
};

export const isAnyReservedKey = (key: string): boolean => {
  return isReservedKey(key) || isReservedParamKey(key);
};

export const filterReservedKeys = (
  query: Record<string, string | string[]>
): Record<string, string | string[]> => {
  const filtered: Record<string, string | string[]> = {};

  Object.entries(query).forEach(([key, value]) => {
    if (!isAnyReservedKey(key)) {
      filtered[key] = value;
    }
  });

  return filtered;
};

export const getParamKey = (key: ReservedKeysType): string => {
  return RESERVED_KEYS_CONFIGS[key].paramKey;
};

export const getOriginalKey = (paramKey: string): ReservedKeysType | null => {
  const entry = Object.entries(RESERVED_KEYS_CONFIGS).find(
    ([_, config]) => config.paramKey === paramKey
  );
  return entry ? (entry[0] as ReservedKeysType) : null;
};
