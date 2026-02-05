"use client";

import { useEffect, useState, useCallback } from "react";
import { AssetType } from "@repo/database/client";

interface Asset {
  url: string;
  type: AssetType;
}

interface FileWithMeta {
  file: File;
  url: string;
  isExisting: boolean;
  type: AssetType;
}

interface UseUrlToFileResult {
  files: FileWithMeta[];
  isLoading: boolean;
  error: string | null;
}

export const useUrlToFile = (
  existingAssets: Asset[] | undefined,
): UseUrlToFileResult => {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndConvert = useCallback(async (assets: Asset[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const filePromises = assets.map(async (asset) => {
        const response = await fetch(asset.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${asset.url}`);
        }

        const blob = await response.blob();
        const fileName = asset.url.split("/").pop() || "file";
        const file = new File([blob], fileName, { type: blob.type });

        return {
          file,
          url: asset.url,
          isExisting: true,
          type: asset.type,
        } as FileWithMeta;
      });

      const results = await Promise.all(filePromises);
      setFiles(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Dosya yüklenirken hata oluştu",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (existingAssets && existingAssets.length > 0) {
      fetchAndConvert(existingAssets);
    } else {
      setFiles([]);
    }
  }, [existingAssets, fetchAndConvert]);

  return { files, isLoading, error };
};
