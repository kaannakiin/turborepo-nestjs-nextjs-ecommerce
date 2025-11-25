"use client";
import {
  ActionIcon,
  Alert,
  AspectRatio,
  Box,
  Button,
  Group,
  Popover,
  SimpleGrid,
  SimpleGridProps,
  Stack,
  Text,
} from "@mantine/core";
import { Dropzone, DropzoneProps, FileRejection } from "@mantine/dropzone";
import { MIME_TYPES } from "@repo/types";
import { $Enums, AssetType } from "@repo/database/client";
import {
  IconAlertCircle,
  IconFile,
  IconFileText,
  IconMusic,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import CustomImage from "./CustomImage";
import GlobalLoadingOverlay from "./GlobalLoadingOverlay";

interface PreviewFile extends File {
  preview?: string;
}

interface GlobalDropzoneProps
  extends Pick<DropzoneProps, "onDrop" | "maxSize" | "maxFiles" | "multiple"> {
  existingImages?: { url: string; type: $Enums.AssetType }[];
  existingImagesDelete?: (url: string) => Promise<void>;
  accept?: $Enums.AssetType[] | $Enums.AssetType;
  cols?: SimpleGridProps["cols"];
  error?: string;
  value: File[] | File | null | undefined;
  onChange?: (value: File[] | File | null) => void;
}

const GlobalDropzone = ({
  onDrop,
  accept = AssetType.IMAGE,
  maxFiles,
  maxSize,
  multiple = true,
  existingImages = [],
  existingImagesDelete,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  value,
  onChange,
}: GlobalDropzoneProps) => {
  const createPreview = (file: File): PreviewFile => {
    if (file.type.startsWith("image/")) {
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
    }
    return file;
  };

  const [files, setFiles] = useState<PreviewFile[]>(() => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.map((file) => createPreview(file));
    } else {
      return [createPreview(value)];
    }
  });

  useEffect(() => {
    if (!value) {
      setFiles([]);
      return;
    }

    if (Array.isArray(value)) {
      const filesFromValue = value.map((file) => createPreview(file));
      setFiles(filesFromValue);
    } else {
      setFiles([createPreview(value)]);
    }
  }, [value]);

  const [deletingExistingImage, setDeletingExistingImage] = useState<
    string | null
  >(null);
  const [openedPopover, setOpenedPopover] = useState<string | null>(null);
  const [rejectionErrors, setRejectionErrors] = useState<string[]>([]);

  const acceptedTypes = Array.isArray(accept) ? accept : [accept];
  const mimeTypes = acceptedTypes.flatMap((type) => MIME_TYPES[type] || []);
  const acceptObject = mimeTypes.reduce(
    (acc, mime) => {
      acc[mime] = [];
      return acc;
    },
    {} as Record<string, string[]>
  );

  // Auto clear rejection errors after 3 seconds
  useEffect(() => {
    if (rejectionErrors.length > 0) {
      const timer = setTimeout(() => {
        setRejectionErrors([]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [rejectionErrors]);

  const updateFormValue = (newFiles: PreviewFile[]) => {
    if (!onChange) return;

    if (!multiple) {
      // Single file mode
      const singleFile = newFiles[0] || null;
      onChange(singleFile);
    } else {
      // Multiple files mode
      onChange(newFiles);
    }
  };

  const handleDrop = (droppedFiles: File[]) => {
    setRejectionErrors([]);

    const filesWithPreview = droppedFiles.map(createPreview);
    let newFiles: PreviewFile[];

    if (!multiple) {
      // Single file mode - replace existing file
      const firstFile = filesWithPreview[0];
      if (firstFile) {
        newFiles = [firstFile];
      } else {
        newFiles = [];
      }
    } else {
      // Multiple files mode - add to existing
      newFiles = [...files, ...filesWithPreview];
    }

    setFiles(newFiles);
    updateFormValue(newFiles);
    onDrop?.(droppedFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <IconPhoto size={40} />;
    if (file.type.startsWith("video/")) return <IconVideo size={40} />;
    if (file.type.startsWith("audio/")) return <IconMusic size={40} />;
    if (file.type === "application/pdf") return <IconFileText size={40} />;
    return <IconFile size={40} />;
  };

  const handleReject = (fileRejections: FileRejection[]) => {
    const errors = fileRejections.flatMap((rejection) =>
      rejection.errors.map((error) => {
        // Türkçe hata mesajları
        switch (error.code) {
          case "file-too-large":
            return `${rejection.file.name}: Dosya boyutu çok büyük (Max: ${maxSize ? Math.round(maxSize / (1024 * 1024)) : 5}MB)`;
          case "file-invalid-type":
            return `${rejection.file.name}: Desteklenmeyen dosya türü`;
          case "too-many-files":
            return `Çok fazla dosya seçildi (Max: ${maxFiles || "sınırsız"})`;
          default:
            return `${rejection.file.name}: ${error.message}`;
        }
      })
    );

    setRejectionErrors(errors);
  };

  const removeFile = (indexToRemove: number) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    const fileToRemove = files[indexToRemove];

    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    setFiles(newFiles);
    updateFormValue(newFiles);
  };

  const handleDeleteExistingImage = async (url: string) => {
    if (!existingImagesDelete) return;

    setOpenedPopover(null);
    setDeletingExistingImage(url);
    try {
      await existingImagesDelete(url);
    } finally {
      setDeletingExistingImage(null);
    }
  };

  const getDropzoneMessage = () => {
    const typeMessages = acceptedTypes.map((type) => {
      switch (type) {
        case AssetType.IMAGE:
          return "Resim";
        case AssetType.VIDEO:
          return "Video";
        case AssetType.AUDIO:
          return "Ses";
        case AssetType.DOCUMENT:
          return "Döküman";
        default:
          return "Dosya";
      }
    });

    return typeMessages.length === 1
      ? `${typeMessages[0]} dosyalarını`
      : `${typeMessages.join(", ")} dosyalarını`;
  };

  const renderFilePreview = (file: File, preview?: string) => {
    if (file.type.startsWith("image/") && preview) {
      return (
        <Image
          src={preview}
          alt={file.name}
          fill
          style={{ objectFit: "contain" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      );
    }

    if (file.type.startsWith("video/")) {
      return (
        <video
          width="100%"
          height="120"
          controls
          style={{ borderRadius: "var(--mantine-radius-sm)" }}
        >
          <source src={URL.createObjectURL(file)} type={file.type} />
        </video>
      );
    }

    if (file.type.startsWith("audio/")) {
      return (
        <Stack align="center" gap="xs">
          {getFileIcon(file)}
          <audio controls style={{ width: "100%" }}>
            <source src={URL.createObjectURL(file)} type={file.type} />
          </audio>
        </Stack>
      );
    }

    return (
      <Stack align="center" gap="xs" py="lg">
        {getFileIcon(file)}
        <Text size="sm" ta="center" c="dimmed">
          {file.type === "application/pdf" ? "PDF" : "Döküman"}
        </Text>
      </Stack>
    );
  };

  const renderExistingImage = (
    image: { url: string; type: $Enums.AssetType },
    index: number
  ) => {
    const uniqueKey = `existing-${index}-${image.url}`;

    return (
      <div key={uniqueKey} style={{ position: "relative" }}>
        {deletingExistingImage === image.url && <GlobalLoadingOverlay />}
        <Stack
          align="center"
          gap="xs"
          p="sm"
          style={{
            border: "1px solid var(--mantine-color-gray-3)",
            borderRadius: "var(--mantine-radius-md)",
            backgroundColor: "var(--mantine-color-gray-0)",
          }}
        >
          <AspectRatio ratio={1} pos="relative" w="100%">
            {image.type === AssetType.IMAGE ? (
              <CustomImage src={image.url} alt="Existing image" />
            ) : (
              <Stack align="center" gap="xs" py="lg">
                <IconFile size={40} />
                <Text size="sm" ta="center" c="dimmed">
                  {image.type}
                </Text>
              </Stack>
            )}
          </AspectRatio>

          {existingImagesDelete && (
            <Popover
              opened={openedPopover === uniqueKey}
              onChange={() => setOpenedPopover(null)}
              position="top"
              withArrow
              shadow="md"
            >
              <Popover.Target>
                <ActionIcon
                  variant="filled"
                  color="red"
                  size="sm"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                  }}
                  onClick={() => setOpenedPopover(uniqueKey)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="xs">
                  <Text size="sm" ta="center">
                    Resmi silmek istediğinize emin misiniz?
                  </Text>
                  <Group gap="xs" justify="flex-end">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => setOpenedPopover(null)}
                    >
                      İptal
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => handleDeleteExistingImage(image.url)}
                    >
                      Evet
                    </Button>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          )}
        </Stack>
      </div>
    );
  };

  return (
    <Stack gap="md">
      {/* Rejection Errors */}
      {rejectionErrors.length > 0 && (
        <Stack gap="xs">
          {rejectionErrors.map((error, index) => (
            <Alert
              key={index}
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              withCloseButton
              onClose={() => {
                setRejectionErrors((prev) =>
                  prev.filter((_, i) => i !== index)
                );
              }}
            >
              {error}
            </Alert>
          ))}
        </Stack>
      )}

      <Dropzone
        multiple={multiple}
        onReject={handleReject}
        onDrop={handleDrop}
        maxSize={maxSize}
        maxFiles={maxFiles}
        accept={acceptObject}
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
            {acceptedTypes.includes(AssetType.IMAGE) ? (
              <IconPhoto
                size={52}
                color="var(--mantine-color-dimmed)"
                stroke={1.5}
              />
            ) : acceptedTypes.includes(AssetType.VIDEO) ? (
              <IconVideo
                size={52}
                color="var(--mantine-color-dimmed)"
                stroke={1.5}
              />
            ) : acceptedTypes.includes(AssetType.AUDIO) ? (
              <IconMusic
                size={52}
                color="var(--mantine-color-dimmed)"
                stroke={1.5}
              />
            ) : (
              <IconFile
                size={52}
                color="var(--mantine-color-dimmed)"
                stroke={1.5}
              />
            )}
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              {getDropzoneMessage()} buraya sürükleyin veya seçmek için tıklayın
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              İstediğiniz kadar dosya ekleyebilirsiniz, her dosya{" "}
              {maxSize ? `${Math.round(maxSize / (1024 * 1024))}MB` : "5MB"}
              &apos;dan küçük olmalıdır
            </Text>
          </div>
        </Group>
      </Dropzone>

      {/* Preview Section */}
      {(existingImages.length > 0 || files.length > 0) && (
        <SimpleGrid cols={cols} spacing="md">
          {existingImages.map((image, index) =>
            renderExistingImage(image, index)
          )}

          {/* New Files */}
          {files.map((file, index) => (
            <div key={`new-${index}`} style={{ position: "relative" }}>
              <Stack
                align="center"
                gap="xs"
                p="sm"
                style={{
                  border: "1px solid var(--mantine-color-gray-3)",
                  borderRadius: "var(--mantine-radius-md)",
                  backgroundColor: "var(--mantine-color-gray-0)",
                }}
              >
                <Box pos="relative" h="240px" p={0} w="100%">
                  {renderFilePreview(file, file.preview)}
                </Box>

                <Popover
                  opened={openedPopover === `new-${index}`}
                  onChange={() => setOpenedPopover(null)}
                  position="top"
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    <ActionIcon
                      variant="filled"
                      color="red"
                      size="sm"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                      onClick={() => setOpenedPopover(`new-${index}`)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Stack gap="xs">
                      <Text size="sm" ta="center">
                        Dosyayı silmek istediğinize emin misiniz?
                      </Text>
                      <Group gap="xs" justify="flex-end">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => setOpenedPopover(null)}
                        >
                          İptal
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => {
                            removeFile(index);
                            setOpenedPopover(null);
                          }}
                        >
                          Evet
                        </Button>
                      </Group>
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              </Stack>
            </div>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
};

export default GlobalDropzone;
