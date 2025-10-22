"use client";
import ActionPopover from "@/(admin)/components/ActionPopoverr";
import CustomImage from "@/components/CustomImage";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ActionIcon,
  Alert,
  AspectRatio,
  Badge,
  Group,
  SimpleGrid,
  Stack,
  StyleProp,
  Text,
} from "@mantine/core";
import { Dropzone, DropzoneProps, FileRejection } from "@mantine/dropzone";
import { $Enums } from "@repo/database";
import { MIME_TYPES } from "@repo/types";

import {
  IconAlertCircle,
  IconGripVertical,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

interface ProductDropzoneProps {
  existingImages: Array<{ url: string; type: $Enums.AssetType; order: number }>;
  images: Array<{ file: File; order: number }>;
  onAddImages: (files: File[]) => void;
  onRemoveNewImage: (file: File) => void;
  onRemoveExistingImage: (url: string) => Promise<void>;
  onReorder?: (
    newOrder: Array<{
      url: string;
      order: number;
      file?: File;
      isNew: boolean; // Bu flag'i ekle
    }>
  ) => void;
  props?: Partial<DropzoneProps>;
  cols?: StyleProp<number>;
}

interface SortableItemProps {
  id: string;
  media: {
    url: string;
    type: $Enums.AssetType;
    order: number;
    isNew: boolean;
    file?: File;
  };
  index: number;
  onRemove: () => void;
}

const SortableItem = ({ id, media, index, onRemove }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <AspectRatio
      ref={setNodeRef}
      style={style}
      maw={240}
      ratio={1}
      pos={"relative"}
      className="p-1 border rounded-md overflow-hidden"
    >
      {media.type === "VIDEO" ? (
        <video
          src={media.url}
          className="w-full h-full object-contain"
          controls={false}
        />
      ) : (
        <CustomImage src={media.url} alt={`Product ${index + 1}`} />
      )}
      <Group
        align="center"
        justify="space-between"
        className="w-full h-4 absolute top-2 pr-2 z-50"
      >
        <Badge color={"admin"} variant={media.isNew ? "filled" : "light"}>
          {media.isNew ? "Yeni" : "Mevcut"} - {index + 1}
        </Badge>
        <Group gap={"lg"}>
          <ActionIcon
            variant="transparent"
            size={"lg"}
            {...attributes}
            {...listeners}
            className={isDragging ? "cursor-grabbing" : "cursor-move"}
          >
            <IconGripVertical />
          </ActionIcon>
          <ActionPopover
            targetIcon={<IconTrash />}
            text={
              "Görseli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
            }
            onConfirm={onRemove}
            size="sm"
          />
        </Group>
      </Group>
    </AspectRatio>
  );
};

const ProductDropzone = ({
  existingImages,
  images,
  props,
  onAddImages,
  onRemoveExistingImage,
  onRemoveNewImage,
  onReorder,
  cols = { base: 2, xs: 2, md: 3, lg: 5 },
}: ProductDropzoneProps) => {
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (rejectedFiles.length > 0) {
      setTimeout(() => {
        setRejectedFiles([]);
      }, 3000);
    }
  }, [rejectedFiles]);

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "file-too-large":
        return "Bazı dosyaların boyutu çok büyük (max 5MB)";
      case "file-invalid-type":
        return "Bazı dosyaların türü geçersiz";
      case "too-many-files":
        return "Çok fazla dosya seçildi (max 10 adet)";
      default:
        return "Dosya yükleme hatası";
    }
  };

  const getUniqueErrors = () => {
    const errorCodes = new Set<string>();
    rejectedFiles.forEach((rejection) => {
      rejection.errors.forEach((error) => {
        errorCodes.add(error.code);
      });
    });
    return Array.from(errorCodes);
  };

  // Stable ID mapping - ID'ler order değişse de sabit kalır
  const sortedMedia = useMemo(() => {
    const allMedia: Array<{
      id: string;
      url: string;
      type: $Enums.AssetType;
      order: number;
      isNew: boolean;
      file?: File;
    }> = [];

    if (existingImages) {
      existingImages.forEach((img) => {
        // URL'i ID olarak kullan, order'ı dahil etme
        allMedia.push({
          id: `existing-${img.url}`,
          url: img.url,
          type: img.type,
          order: img.order,
          isNew: false,
        });
      });
    }

    if (images) {
      images.forEach((img) => {
        const isVideo = img.file.type.startsWith("video/");
        // File'ın name ve size'ını ID olarak kullan (daha stable)
        allMedia.push({
          id: `new-${img.file.name}-${img.file.size}`,
          url: URL.createObjectURL(img.file),
          type: isVideo ? "VIDEO" : "IMAGE",
          order: img.order,
          isNew: true,
          file: img.file,
        });
      });
    }

    return allMedia.sort((a, b) => a.order - b.order);
  }, [existingImages, images]);

  // Blob URL cleanup
  useEffect(() => {
    const blobUrls = sortedMedia
      .filter((media) => media.isNew && media.url.startsWith("blob:"))
      .map((media) => media.url);

    return () => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [sortedMedia]);

  const handleRemove = async (media: (typeof sortedMedia)[0]) => {
    if (media.isNew && media.file && onRemoveNewImage) {
      onRemoveNewImage(media.file);
    } else if (!media.isNew && onRemoveExistingImage) {
      try {
        setLoading(true);
        await onRemoveExistingImage(media.url);
      } catch (error) {
        console.error("Mevcut görseli silerken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // ProductDropzone.tsx içinde handleDragEnd fonksiyonu
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedMedia.findIndex((item) => item.id === active.id);
      const newIndex = sortedMedia.findIndex((item) => item.id === over.id);

      const reorderedMedia = arrayMove(sortedMedia, oldIndex, newIndex);

      const newOrder = reorderedMedia.map((media, index) => ({
        url: media.url,
        order: index,
        file: media.file,
        isNew: media.isNew,
      }));

      if (onReorder) {
        onReorder(newOrder);
      }
    }
  };

  return (
    <Stack gap={"xs"}>
      {loading && <GlobalLoadingOverlay />}
      {rejectedFiles.length > 0 && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Dosya Yükleme Hatası"
          color="red"
          withCloseButton
          onClose={() => setRejectedFiles([])}
        >
          {getUniqueErrors().map((errorCode, index) => (
            <Text key={index} size="sm">
              • {getErrorMessage(errorCode)}
            </Text>
          ))}
        </Alert>
      )}
      <Dropzone
        onDrop={(acceptedFiles) => {
          onAddImages(acceptedFiles);
        }}
        onReject={(files) => {
          setRejectedFiles((current) => [...current, ...files]);
        }}
        maxSize={10 * 1024 ** 2}
        accept={[...MIME_TYPES["IMAGE"], ...MIME_TYPES["VIDEO"]]}
        multiple
        maxFiles={10 - ((existingImages?.length || 0) + (images?.length || 0))}
        {...props}
      >
        <Group
          justify="center"
          gap="xl"
          mih={220}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={52}
              color="var(--mantine-color-blue-6)"
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              size={52}
              color="var(--mantine-color-dimmed)"
              stroke={1.5}
            />
          </Dropzone.Idle>
          <div>
            <Text size="xl" inline>
              Görselleri buraya sürükleyin veya dosya seçmek için tıklayın
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Ürün görselleri maksimum 10 adet olabilir ve her biri 5MB&apos;den
              küçük olmalıdır.
            </Text>
          </div>
        </Group>
      </Dropzone>

      {sortedMedia.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedMedia.map((media) => media.id)}
            strategy={rectSortingStrategy}
          >
            <SimpleGrid cols={cols} className="w-full">
              {sortedMedia.map((media, index) => (
                <SortableItem
                  key={media.id}
                  id={media.id}
                  media={media}
                  index={index}
                  onRemove={() => handleRemove(media)}
                />
              ))}
            </SimpleGrid>
          </SortableContext>
        </DndContext>
      )}
    </Stack>
  );
};

export default ProductDropzone;
