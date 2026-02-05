"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  IconDownload,
  IconEye,
  IconGripVertical,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { formatFileSize } from "../../lib/image-helpers";
import { FileItem, SortableFileListProps } from "./file-input-types";

interface SortableFileItemProps {
  item: FileItem;
  onRemove: () => void;
  onPreview: () => void;
}

const SortableFileItem = ({
  item,
  onRemove,
  onPreview,
}: SortableFileItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPreviewable =
    item.type === AssetType.IMAGE || item.type === AssetType.VIDEO;

  return (
    <Group
      ref={setNodeRef}
      style={style}
      gap="xs"
      wrap="nowrap"
      p="xs"
      className="bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
    >
      <ActionIcon
        variant="subtle"
        size="sm"
        color="gray"
        {...attributes}
        {...listeners}
        className={isDragging ? "cursor-grabbing" : "cursor-grab"}
      >
        <IconGripVertical size={16} />
      </ActionIcon>

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

const SortableFileList = ({
  items,
  onRemove,
  onPreview,
  onOrderChange,
}: SortableFileListProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const [localItems, setLocalItems] = useState<FileItem[]>(items);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handlePreview = (item: FileItem) => {
    setPreviewItem(item);
    open();
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setLocalItems((currentItems) => {
          const oldIndex = currentItems.findIndex(
            (item) => item.id === active.id,
          );
          const newIndex = currentItems.findIndex(
            (item) => item.id === over.id,
          );
          const reordered = arrayMove(currentItems, oldIndex, newIndex);

          onOrderChange?.(reordered);
          return reordered;
        });
      }
    },
    [onOrderChange],
  );

  // Sync with external items
  if (items !== localItems && items.length !== localItems.length) {
    setLocalItems(items);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack gap="xs">
            {localItems.map((item) => (
              <SortableFileItem
                key={item.id}
                item={item}
                onPreview={() => handlePreview(item)}
                onRemove={() => onRemove(item)}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>

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

export default SortableFileList;
