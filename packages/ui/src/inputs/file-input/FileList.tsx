"use client";

import {
  ActionIcon,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AssetType } from "@repo/database/client";
import { IconDownload, IconEye, IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { formatFileSize } from "../../lib/image-helpers";
import { FileItem, FileListProps } from "./file-input-types";

interface FileItemRowProps {
  item: FileItem;
  onRemove: () => void;
  onPreview: () => void;
}

const FileItemRow = ({ item, onRemove, onPreview }: FileItemRowProps) => {
  const isPreviewable =
    item.type === AssetType.IMAGE || item.type === AssetType.VIDEO;

  return (
    <Group
      gap="xs"
      wrap="nowrap"
      p="xs"
      className="bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
    >
      <Text size="sm" className="flex-1 truncate">
        {item.file.name}{" "}
        <Text span c="dimmed" size="xs">
          ({formatFileSize(item.file.size)})
        </Text>
      </Text>

      <Group gap="xs">
        {isPreviewable ? (
          <Tooltip label="Önizle">
            <ActionIcon variant="subtle" size="sm" onClick={onPreview}>
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip label="İndir">
            <ActionIcon
              variant="subtle"
              size="sm"
              component="a"
              href={item.url}
              download={item.file.name}
            >
              <IconDownload size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        <Tooltip label={item.isExisting ? "Sil" : "Kaldır"}>
          <ActionIcon variant="subtle" size="sm" color="red" onClick={onRemove}>
            {item.isExisting ? <IconTrash size={16} /> : <IconX size={16} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
};

const FileList = ({ items, onRemove, onPreview }: FileListProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);

  const handlePreview = (item: FileItem) => {
    setPreviewItem(item);
    open();
  };

  return (
    <>
      <Stack gap="xs">
        {items.map((item) => (
          <FileItemRow
            key={item.id}
            item={item}
            onRemove={() => onRemove(item)}
            onPreview={() => handlePreview(item)}
          />
        ))}
      </Stack>

      <Modal opened={opened} onClose={close} size="lg" title="Önizleme">
        {previewItem && (
          <>
            {previewItem.type === AssetType.VIDEO ? (
              <video
                src={previewItem.url}
                controls
                className="w-full max-h-[70vh]"
              />
            ) : (
              <Image
                src={previewItem.url}
                alt={previewItem.file.name}
                className="max-h-[70vh] object-contain"
              />
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default FileList;
