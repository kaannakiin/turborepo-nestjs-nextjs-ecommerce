"use client";

import { Button, FileButton, Stack, Tooltip } from "@mantine/core";
import { AssetType } from "@repo/database/client";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUrlToFile } from "../../hooks/useUrlToFile";
import { getAcceptTypeInfo, getAcceptTypes } from "../../lib/image-helpers";
import FileList from "./FileList";
import { Asset, FileItem } from "./file-input-types";

const SortableFileList = lazy(() => import("./SortableFileList"));

export interface FileInputProps {
  accept?: AssetType | AssetType[];
  existingFiles?: Asset[];
  removeExistingFileFn?: (url: string) => Promise<void>;
  maxFiles?: number;
  multiple?: boolean;
  sortable?: boolean;
  maxSize?: number;
  value?: File | File[] | null;
  onChange?: (files: File | File[] | null) => void;
  onOrderChange?: (items: FileItem[]) => void;
}

const FileInput = ({
  accept,
  existingFiles,
  removeExistingFileFn,
  multiple = false,
  sortable = false,
  onChange,
  onOrderChange,
  value,
}: FileInputProps) => {
  const acceptTypes = accept ? getAcceptTypes(accept).join(",") : undefined;
  const acceptInfo = accept ? getAcceptTypeInfo(accept) : undefined;

  const { files: existingFileObjects, isLoading } = useUrlToFile(existingFiles);
  const [localFiles, setLocalFiles] = useState<FileItem[]>([]);
  const blobUrlCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (existingFileObjects.length > 0) {
      const existingItems: FileItem[] = existingFileObjects.map((f, index) => ({
        id: `existing-${f.url}-${index}`,
        file: f.file,
        url: f.url,
        isExisting: true,
        type: f.type,
        originalUrl: f.url,
      }));

      setLocalFiles((prev) => {
        const newFiles = prev.filter((p) => !p.isExisting);
        return [...existingItems, ...newFiles];
      });
    }
  }, [existingFileObjects]);

  useEffect(() => {
    if (value) {
      const valueArray = Array.isArray(value) ? value : [value];

      const newItems: FileItem[] = valueArray.map((file, index) => {
        const cacheKey = `${file.name}-${file.size}`;
        let blobUrl = blobUrlCache.current.get(cacheKey);

        if (!blobUrl) {
          blobUrl = URL.createObjectURL(file);
          blobUrlCache.current.set(cacheKey, blobUrl);
        }

        const type = file.type.startsWith("video/")
          ? AssetType.VIDEO
          : file.type.startsWith("image/")
            ? AssetType.IMAGE
            : file.type.startsWith("audio/")
              ? AssetType.AUDIO
              : AssetType.DOCUMENT;

        return {
          id: `new-${cacheKey}-${index}`,
          file,
          url: blobUrl,
          isExisting: false,
          type,
        };
      });

      setLocalFiles((prev) => {
        const existingItems = prev.filter((p) => p.isExisting);
        return [...existingItems, ...newItems];
      });
    } else {
      setLocalFiles((prev) => prev.filter((p) => p.isExisting));
    }
  }, [value]);

  useEffect(() => {
    const cache = blobUrlCache.current;
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  const handleAddFiles = useCallback(
    async (files: File | File[]) => {
      const fileArray = Array.isArray(files) ? files : [files];

      if (multiple) {
        const currentNewFiles = localFiles
          .filter((f) => !f.isExisting)
          .map((f) => f.file);
        onChange?.([...currentNewFiles, ...fileArray]);
      } else {
        const existingItems = localFiles.filter((f) => f.isExisting);

        if (existingItems.length > 0 && removeExistingFileFn) {
          for (const item of existingItems) {
            if (item.originalUrl) {
              await removeExistingFileFn(item.originalUrl);
            }
          }
        }

        onChange?.(fileArray[0] || null);
      }
    },
    [localFiles, multiple, onChange, removeExistingFileFn],
  );

  const handleRemoveNew = useCallback(
    (item: FileItem) => {
      const newFiles = localFiles
        .filter((f) => !f.isExisting && f.id !== item.id)
        .map((f) => f.file);

      if (multiple) {
        onChange?.(newFiles.length > 0 ? newFiles : null);
      } else {
        onChange?.(null);
      }
    },
    [localFiles, multiple, onChange],
  );

  const handleRemoveExisting = useCallback(
    async (item: FileItem) => {
      if (removeExistingFileFn && item.originalUrl) {
        await removeExistingFileFn(item.originalUrl);
      }
      setLocalFiles((prev) => prev.filter((f) => f.id !== item.id));
    },
    [removeExistingFileFn],
  );

  const handleRemove = useCallback(
    (item: FileItem) => {
      if (item.isExisting) {
        handleRemoveExisting(item);
      } else {
        handleRemoveNew(item);
      }
    },
    [handleRemoveExisting, handleRemoveNew],
  );

  const handleOrderChange = useCallback(
    (items: FileItem[]) => {
      setLocalFiles(items);

      const newFiles = items.filter((f) => !f.isExisting).map((f) => f.file);
      if (newFiles.length > 0) {
        if (multiple) {
          onChange?.(newFiles);
        } else {
          onChange?.(newFiles[0] || null);
        }
      }

      onOrderChange?.(items);
    },
    [multiple, onChange, onOrderChange],
  );

  const handlePreview = useCallback((item: FileItem) => {}, []);

  const ListComponent = sortable ? SortableFileList : FileList;

  return (
    <Stack gap="xs">
      <FileButton
        accept={acceptTypes}
        multiple={multiple}
        onChange={handleAddFiles}
      >
        {(buttonProps) => (
          <Button
            {...buttonProps}
            loading={isLoading}
            leftSection={
              acceptInfo && (
                <Tooltip label={acceptInfo}>
                  <IconInfoCircle size={18} />
                </Tooltip>
              )
            }
          >
            Dosya Yükle
          </Button>
        )}
      </FileButton>

      {localFiles.length > 0 &&
        (sortable ? (
          <Suspense fallback={null}>
            <SortableFileList
              items={localFiles}
              onRemove={handleRemove}
              onPreview={handlePreview}
              onOrderChange={handleOrderChange}
            />
          </Suspense>
        ) : (
          <FileList
            items={localFiles}
            onRemove={handleRemove}
            onPreview={handlePreview}
          />
        ))}
    </Stack>
  );
};

export default FileInput;
