import { AssetType } from "@repo/database/client";
import { MIME_TYPES, getAssetTypeMessage } from "@repo/types";

export const getExternalImageSrc = (
  originalSrc: string,
  externalName: string = "thumbnail",
  format: string = "webp",
): string | null => {
  if (!originalSrc) return null;

  try {
    const lastDotIndex = originalSrc.lastIndexOf(".");
    if (lastDotIndex === -1) return null;

    const base = originalSrc.substring(0, lastDotIndex);
    return `${base}-${externalName}.${format}`;
  } catch {
    return null;
  }
};

export const getAcceptTypes = (types: AssetType | AssetType[]) => {
  const typeArray = Array.isArray(types) ? types : [types];
  return typeArray.map((type) => MIME_TYPES[type].join(","));
};

export const getAcceptTypeInfo = (types: AssetType | AssetType[]) => {
  const typeArray = Array.isArray(types) ? types : [types];
  return getAssetTypeMessage(typeArray);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
