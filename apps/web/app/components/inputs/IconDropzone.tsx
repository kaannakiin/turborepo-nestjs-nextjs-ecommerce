"use client";

import {
  ActionIcon,
  Box,
  Group,
  Image,
  rem,
  SimpleGrid,
  SimpleGridProps,
} from "@mantine/core";
import { Dropzone, DropzoneProps, FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { AssetType } from "@repo/database/client";
import { getMimeTypesForAssetType } from "@repo/types";
import { IconPlus, IconTrash, IconX } from "@tabler/icons-react";

type ValueType = File | string;

interface IconDropzoneProps extends Omit<
  DropzoneProps,
  "accept" | "onChange" | "onDrop"
> {
  accepts?: AssetType | AssetType[];
  cols?: SimpleGridProps["cols"];
  value?: ValueType | ValueType[] | null;
  onChange?: (value: ValueType | ValueType[] | null) => void;
}

const IconDropzone = ({
  accepts = AssetType.IMAGE,
  multiple = false,
  cols = 4,
  value,
  onChange,
  ...props
}: IconDropzoneProps) => {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  const getImageUrl = (item: ValueType) => {
    if (typeof item === "string") return item;
    return URL.createObjectURL(item);
  };

  const handleDrop = (files: FileWithPath[]) => {
    if (!onChange) return;

    if (multiple) {
      onChange([...values, ...files]);
    } else {
      onChange(files[0]);
    }
  };

  const handleReject = () => {
    notifications.show({
      title: "Hatalı Dosya",
      message: "Dosya formatı veya boyutu uygun değil.",
      color: "red",
      icon: <IconX size={16} />,
    });
  };

  const handleDelete = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    if (!onChange) return;

    if (multiple) {
      const newValues = values.filter((_, i) => i !== indexToRemove);
      onChange(newValues);
    } else {
      onChange(null);
    }
  };

  const baseBoxStyle = {
    width: rem(100),
    height: rem(100),
    borderRadius: "var(--mantine-radius-md)",
    overflow: "hidden",
    border: "1px solid var(--mantine-color-gray-4)",
    backgroundColor: "var(--mantine-color-gray-0)",
    position: "relative" as const,
  };

  const dropzoneStyle = {
    ...baseBoxStyle,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    padding: 0,
    transition: "background-color 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "var(--mantine-color-gray-1)",
    },
    "&[data-reject]": {
      borderColor: "var(--mantine-color-red-6)",
      backgroundColor: "var(--mantine-color-red-0)",
    },
  };

  const acceptedMimeTypes = Array.isArray(accepts)
    ? accepts.flatMap(getMimeTypesForAssetType)
    : getMimeTypesForAssetType(accepts);

  const DropzoneContent = () => (
    <Group
      justify="center"
      align="center"
      gap={0}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <Dropzone.Reject>
        <IconX
          style={{ width: rem(32), height: rem(32) }}
          color="var(--mantine-color-red-6)"
          stroke={1.5}
        />
      </Dropzone.Reject>

      <Dropzone.Idle>
        <IconPlus
          style={{ width: rem(32), height: rem(32) }}
          color="var(--mantine-color-dimmed)"
          stroke={1.5}
        />
      </Dropzone.Idle>

      <Dropzone.Accept>
        <IconPlus
          style={{ width: rem(32), height: rem(32) }}
          color="var(--mantine-color-blue-6)"
          stroke={1.5}
        />
      </Dropzone.Accept>
    </Group>
  );

  const ImagePreview = ({
    item,
    index,
  }: {
    item: ValueType;
    index: number;
  }) => {
    const url = getImageUrl(item);

    return (
      <Box style={baseBoxStyle}>
        <Image src={url} alt="Preview" w="100%" h="100%" fit="contain" />

        <ActionIcon
          color="red"
          variant="filled"
          size="sm"
          pos="absolute"
          top={4}
          right={4}
          onClick={(e) => handleDelete(e, index)}
          style={{ zIndex: 10 }}
        >
          <IconTrash size={12} />
        </ActionIcon>
      </Box>
    );
  };

  if (multiple) {
    return (
      <SimpleGrid cols={cols} verticalSpacing="xs" spacing="xs">
        {values.map((item, index) => (
          <ImagePreview
            key={typeof item === "string" ? item : `file-${index}`}
            item={item}
            index={index}
          />
        ))}

        <Dropzone
          accept={acceptedMimeTypes}
          multiple={true}
          onDrop={handleDrop}
          onReject={handleReject}
          {...props}
          styles={{
            inner: { width: "100%", height: "100%" },
            root: dropzoneStyle,
          }}
        >
          <DropzoneContent />
        </Dropzone>
      </SimpleGrid>
    );
  }

  const singleItem = values[0];

  return (
    <Dropzone
      accept={acceptedMimeTypes}
      multiple={false}
      onDrop={handleDrop}
      onReject={handleReject}
      {...props}
      styles={{
        inner: { width: "100%", height: "100%" },
        root: {
          ...dropzoneStyle,
          borderStyle: singleItem ? "solid" : "dashed",
        },
      }}
    >
      {singleItem ? (
        <Box w="100%" h="100%" pos="relative">
          <Image
            src={getImageUrl(singleItem)}
            alt="Preview"
            w="100%"
            h="100%"
            fit="contain"
            style={{ display: "block" }}
          />

          <Box style={{ pointerEvents: "auto" }}>
            <ActionIcon
              color="red"
              variant="filled"
              size="sm"
              pos="absolute"
              top={4}
              right={4}
              onClick={(e) => handleDelete(e, 0)}
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Box>
        </Box>
      ) : (
        <DropzoneContent />
      )}
    </Dropzone>
  );
};

export default IconDropzone;
