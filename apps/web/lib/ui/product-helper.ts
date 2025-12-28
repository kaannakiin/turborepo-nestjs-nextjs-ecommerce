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
