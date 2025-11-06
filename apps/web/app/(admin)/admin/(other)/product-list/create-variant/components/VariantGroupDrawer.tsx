"use client";
import GlobalDropzone from "@/components/GlobalDropzone";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  ColorInput,
  ColorSwatch,
  Drawer,
  DrawerProps,
  Group,
  Modal,
  Popover,
  Radio,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import {
  Control,
  Controller,
  createId,
  SubmitHandler,
  useFieldArray,
  useForm,
  zodResolver,
  useWatch,
} from "@repo/shared";
import { VariantGroupSchema, VariantGroupZodType } from "@repo/types";
import {
  IconArrowBarToLeft,
  IconChevronDown,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import classes from "./RadioCard.module.css";

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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CreatableSelect from "./CreatableSelect";
import fetchWrapper from "@lib/fetchWrapper";
import { $Enums } from "@repo/database";

interface VariantGroupDrawerProps
  extends Pick<DrawerProps, "opened" | "onClose"> {
  onSubmit: SubmitHandler<VariantGroupZodType>;
  defaultValues?: VariantGroupZodType;
}

type VariantOption = VariantGroupZodType["options"][number];
type DeletedVariant = Omit<VariantOption, "id">;

interface SortableVariantItemProps {
  id: string;
  index: number;
  control: Control<VariantGroupZodType>;
  onEdit: () => void;
  onDelete: () => void;
  type: $Enums.VariantGroupType;
}

const SortableVariantItem = ({
  id,
  index,
  control,
  onEdit,
  onDelete,
  type,
}: SortableVariantItemProps) => {
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleDeleteConfirm = () => {
    onDelete();
    setDeletePopoverOpened(false);
  };

  const fieldFile = useWatch({
    control,
    name: `options.${index}.file`,
  });
  const fieldExistingFile = useWatch({
    control,
    name: `options.${index}.existingFile`,
  });
  const fieldHexValue = useWatch({
    control,
    name: `options.${index}.hexValue`,
  });
  const fieldTranslations = useWatch({
    control,
    name: `options.${index}.translations`,
  });

  const getImageUrl = () => {
    if (fieldFile && typeof fieldFile !== "string") {
      return URL.createObjectURL(fieldFile);
    }
    return fieldExistingFile || null;
  };

  const imageUrl = getImageUrl();

  const renderVisual = () => {
    if (type === "COLOR") {
      if (imageUrl) {
        return <Avatar src={imageUrl} size="sm" radius="xs" />;
      } else if (fieldHexValue) {
        return <ColorSwatch color={fieldHexValue} size={24} />;
      }
    }
    return null;
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Group
        gap={"xs"}
        align="center"
        justify="space-between"
        bg={"gray.1"}
        p="xs"
        style={{
          borderRadius: "8px",
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        <Group gap={"xs"} align="center">
          <Group gap="xs">
            <ActionIcon
              variant="transparent"
              size={"lg"}
              c={"admin"}
              color="admin"
              style={{ cursor: "grab" }}
              {...attributes}
              {...listeners}
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
            {renderVisual()}
          </Group>

          {isEditing ? (
            <Controller
              control={control}
              name={`options.${index}.translations.0.name`}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  error={fieldState.error?.message}
                  onChange={(value) => {
                    if (value.currentTarget.value !== "") {
                      field.onChange(value.currentTarget.value);
                    }
                  }}
                  variant="filled"
                  c={"admin"}
                  autoFocus
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === "Escape") {
                      setIsEditing(false);
                    }
                  }}
                />
              )}
            />
          ) : (
            <Text
              style={{
                cursor: "pointer",
                flex: 1,
                padding: "8px 12px",
                borderRadius: "4px",
                minHeight: "36px",
                display: "flex",
                alignItems: "center",
              }}
              onDoubleClick={() => setIsEditing(true)}
            >
              {fieldTranslations?.[0]?.name || ""}
            </Text>
          )}
        </Group>
        <Group gap={"md"} align="center" justify="flex-end">
          {type === "COLOR" && (
            <ActionIcon
              size={"sm"}
              variant={"transparent"}
              color={"admin"}
              onClick={onEdit}
            >
              <IconEdit />
            </ActionIcon>
          )}

          <Popover
            position="top"
            withArrow
            shadow="md"
            opened={deletePopoverOpened}
            onChange={setDeletePopoverOpened}
          >
            <Popover.Target>
              <ActionIcon
                size={"sm"}
                variant={"transparent"}
                color={"admin"}
                onClick={() => setDeletePopoverOpened(true)}
              >
                <IconTrash />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap="xs" w={200}>
                <Text size="sm">
                  Varyant opsiyonunu silmek istiyor musunuz?
                </Text>
                <Group justify="flex-end" gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    color="gray"
                    onClick={() => setDeletePopoverOpened(false)}
                  >
                    İptal
                  </Button>
                  <Button size="xs" color="red" onClick={handleDeleteConfirm}>
                    Evet
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
    </div>
  );
};

const VariantGroupDrawer = ({
  onClose,
  opened,
  onSubmit,
  defaultValues,
}: VariantGroupDrawerProps) => {
  const [variantError, setVariantError] = useState<string | null>(null);
  const [variantName, setVariantName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedVariantOptionModal, setSelectedVariantOptionModal] = useState<
    string | null
  >(null);
  const [allDeleteVariantPopover, setAllDeleteVariantPopover] = useState(false);

  const [deletedVariants, setDeletedVariants] = useState<DeletedVariant[]>([]);

  const initialValues: VariantGroupZodType = {
    type: "LIST",
    uniqueId: createId(),
    options: [],
    renderVisibleType: "DROPDOWN",
    translations: [
      {
        locale: "TR",
        name: "",
        slug: "",
      },
    ],
  };

  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    reset,
  } = useForm<VariantGroupZodType>({
    resolver: zodResolver(VariantGroupSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (opened) {
      if (defaultValues) {
        reset(defaultValues);
      } else {
        reset(initialValues);
      }
      setDeletedVariants([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, defaultValues, reset]);

  const type = watch("type") || "LIST";
  const uniqueId = watch("uniqueId");
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "options",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddVariant = () => {
    if (!variantName.trim()) return;

    const existingNames = fields
      .map((field) =>
        field.translations?.find((t) => t.locale === "TR")?.name.toLowerCase()
      )
      .filter(Boolean);

    if (existingNames.includes(variantName.toLowerCase().trim())) {
      setVariantError("Bu varyant zaten mevcut");
      setTimeout(() => {
        setVariantError(null);
      }, 1000);
      return;
    }

    setVariantError(null);

    append({
      translations: [
        {
          name: variantName.trim(),
          locale: "TR",
          slug: variantName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        },
      ],
      uniqueId: createId(),
      file: null,
      hexValue: "#000000",
    });

    setVariantName("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  const handleDeleteSingleVariant = (index: number) => {
    const variantData = fields[index];
    const { id, ...variantWithoutId } = variantData as VariantOption & {
      id: string;
    };

    setDeletedVariants((prev) => [...prev, variantWithoutId]);
    remove(index);
  };

  const handleDeleteAllVariants = () => {
    const allVariants = fields.map((field) => {
      const { id, ...rest } = field as VariantOption & { id: string };
      return rest;
    });

    setDeletedVariants((prev) => [...prev, ...allVariants]);

    for (let i = fields.length - 1; i >= 0; i--) {
      remove(i);
    }

    setAllDeleteVariantPopover(false);
  };

  const handleRestoreDeletedVariants = () => {
    deletedVariants.forEach((variant) => {
      append(variant);
    });

    setDeletedVariants([]);
  };

  const getSelectedVariantIndex = () => {
    if (!selectedVariantOptionModal) return -1;
    return fields.findIndex((field) => field.id === selectedVariantOptionModal);
  };

  const selectedVariantIndex = getSelectedVariantIndex();

  return (
    <>
      {isSubmitting && <GlobalLoadingOverlay />}

      <Drawer.Root
        opened={opened}
        onClose={onClose}
        position="right"
        size={"lg"}
        closeOnClickOutside={!selectedVariantOptionModal}
        closeOnEscape={!selectedVariantOptionModal}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title fw={700} fz={"lg"}>
              Varyant
            </Drawer.Title>

            <Group gap={"md"}>
              <Button variant="outline" color="gray" onClick={onClose}>
                Vazgeç
              </Button>
              <Button
                variant="filled"
                onClick={() => {
                  if (!uniqueId || uniqueId === "") {
                    setValue("uniqueId", createId());
                  }
                  handleSubmit(onSubmit)();
                }}
              >
                {defaultValues ? "Güncelle" : "Kaydet"}
              </Button>
            </Group>
          </Drawer.Header>
          <Drawer.Body>
            <Stack gap={"lg"}>
              <Controller
                control={control}
                name="translations.0.name"
                render={({ field, fieldState }) => (
                  <CreatableSelect
                    {...field}
                    value={field.value || ""}
                    onChange={field.onChange}
                    reset={reset}
                    setValue={setValue}
                    error={fieldState.error?.message}
                    label="Varyant Türü Adı"
                    data-autofocus={!defaultValues}
                  />
                )}
              />

              <Stack gap={"xs"}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field, fieldState }) => {
                    return (
                      <Radio.Group
                        {...field}
                        onChange={(value) => {
                          field.onChange(value as $Enums.VariantGroupType);
                        }}
                        error={fieldState.error?.message}
                        label="Seçim Stili"
                        withAsterisk
                      >
                        <SimpleGrid cols={{ xs: 1, sm: 2 }} pt={"2px"}>
                          <Radio.Card
                            value={$Enums.VariantGroupType.LIST}
                            className={classes.root}
                            radius="md"
                          >
                            <Group wrap="nowrap" gap={"xs"} align="flex-start">
                              <Radio.Indicator c={"admin"} color="admin" />
                              <Stack gap={"xs"}>
                                <Text className={classes.label}>Liste</Text>
                                <Group gap={"xs"}>
                                  <Badge
                                    variant="light"
                                    size="xl"
                                    radius={0}
                                    color="gray"
                                  >
                                    XL
                                  </Badge>
                                  <Badge
                                    variant="light"
                                    size="lg"
                                    radius={0}
                                    color="gray"
                                  >
                                    L
                                  </Badge>
                                  <Badge
                                    variant="light"
                                    size="md"
                                    radius={0}
                                    color="gray"
                                  >
                                    M
                                  </Badge>
                                </Group>
                              </Stack>
                            </Group>
                          </Radio.Card>
                          <Radio.Card
                            value={$Enums.VariantGroupType.COLOR}
                            className={classes.root}
                            radius="md"
                            color="admin"
                            c="admin"
                          >
                            <Group wrap="nowrap" gap={"xs"} align="flex-start">
                              <Radio.Indicator c={"admin"} color="admin" />
                              <Stack gap={"xs"}>
                                <Text className={classes.label}>
                                  Renk/Görsel
                                </Text>
                                <Group gap={"xs"}>
                                  <ColorSwatch color="gray" />
                                  <ColorSwatch color="white" />
                                </Group>
                              </Stack>
                            </Group>
                          </Radio.Card>
                        </SimpleGrid>
                      </Radio.Group>
                    );
                  }}
                />

                <Controller
                  control={control}
                  name="renderVisibleType"
                  render={({ field, fieldState }) => (
                    <Radio.Group
                      {...field}
                      onChange={(value) => {
                        field.onChange(value as $Enums.VariantGroupRenderType);
                      }}
                      error={fieldState.error?.message}
                      label="Gösterim Şekli"
                      withAsterisk
                      mt="md"
                    >
                      <SimpleGrid cols={{ xs: 1, sm: 2 }} pt={"2px"}>
                        <Radio.Card
                          value={$Enums.VariantGroupRenderType.BADGE}
                          className={classes.root}
                          radius="md"
                        >
                          <Group wrap="nowrap" gap={"xs"} align="flex-start">
                            <Radio.Indicator c={"admin"} color="admin" />
                            <Stack gap={"xs"}>
                              <Text className={classes.label}>
                                Buton/Etiket (Badge)
                              </Text>
                              <Group gap={"xs"}>
                                <Badge
                                  variant="light"
                                  size="md"
                                  radius="sm"
                                  color="gray"
                                >
                                  Küçük
                                </Badge>
                                <Badge
                                  variant="light"
                                  size="md"
                                  radius="sm"
                                  color="gray"
                                >
                                  Orta
                                </Badge>
                                <Badge
                                  variant="light"
                                  size="md"
                                  radius="sm"
                                  color="gray"
                                >
                                  Büyük
                                </Badge>
                              </Group>
                              <Text size="xs" c="gray.6">
                                Az sayıda seçenek için uygundur.
                              </Text>
                            </Stack>
                          </Group>
                        </Radio.Card>
                        <Radio.Card
                          value={$Enums.VariantGroupRenderType.DROPDOWN}
                          className={classes.root}
                          radius="md"
                        >
                          <Group wrap="nowrap" gap={"xs"} align="flex-start">
                            <Radio.Indicator c={"admin"} color="admin" />
                            <Stack gap={"xs"}>
                              <Text className={classes.label}>
                                Açılır Liste (Dropdown)
                              </Text>
                              <Group
                                gap={"xs"}
                                style={{
                                  border:
                                    "1px solid var(--mantine-color-gray-3)",
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                }}
                              >
                                <Text size="sm" color="gray.6">
                                  Seçenek 1
                                </Text>
                                <IconChevronDown
                                  size={16}
                                  color="var(--mantine-color-gray-6)"
                                  style={{ marginLeft: "auto" }}
                                />
                              </Group>
                              <Text size="xs" c="gray.6">
                                Daha fazla seçenek için idealdir.
                              </Text>
                            </Stack>
                          </Group>
                        </Radio.Card>
                      </SimpleGrid>
                    </Radio.Group>
                  )}
                />
              </Stack>

              <TextInput
                ref={inputRef}
                labelProps={{
                  className: "w-full",
                }}
                label={
                  <Group justify="space-between" my={"xs"}>
                    <Text>
                      Varyantlar <span className="text-red-500">*</span>
                    </Text>
                    <Stack align="end" gap="xs">
                      {fields.length > 0 && (
                        <Popover
                          width={200}
                          position="bottom"
                          withArrow
                          shadow="md"
                          opened={allDeleteVariantPopover}
                          onChange={setAllDeleteVariantPopover}
                        >
                          <Popover.Target>
                            <UnstyledButton
                              className="flex flex-row gap-1 text-xs text-red-500 text-center"
                              onClick={() => setAllDeleteVariantPopover(true)}
                            >
                              <IconTrash size={16} />
                              Tümünü Sil
                            </UnstyledButton>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Stack gap="xs">
                              <Text size="sm">
                                Tüm varyant opsiyonlarını silmek istiyor
                                musunuz?
                              </Text>
                              <Group justify="flex-end">
                                <Button
                                  size="xs"
                                  variant="light"
                                  color="gray"
                                  onClick={() =>
                                    setAllDeleteVariantPopover(false)
                                  }
                                >
                                  Hayır
                                </Button>
                                <Button
                                  size="xs"
                                  color="red"
                                  onClick={handleDeleteAllVariants}
                                >
                                  Evet
                                </Button>
                              </Group>
                            </Stack>
                          </Popover.Dropdown>
                        </Popover>
                      )}

                      {deletedVariants.length > 0 && (
                        <Button
                          size="xs"
                          variant="light"
                          onClick={handleRestoreDeletedVariants}
                        >
                          {deletedVariants.length} silinen varyantı geri getir
                        </Button>
                      )}
                    </Stack>
                  </Group>
                }
                rightSection={<IconArrowBarToLeft />}
                value={variantName}
                onChange={(e) => setVariantName(e.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddVariant();
                  }
                }}
                error={variantError || errors.options?.message || undefined}
                variant="filled"
              />

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack gap={"xs"}>
                    {fields.map((field, index) => (
                      <SortableVariantItem
                        key={field.id}
                        id={field.id}
                        index={index}
                        control={control}
                        type={type}
                        onEdit={() => setSelectedVariantOptionModal(field.id)}
                        onDelete={() => handleDeleteSingleVariant(index)}
                      />
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
            </Stack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>

      {selectedVariantOptionModal !== null && selectedVariantIndex !== -1 && (
        <Modal
          size={"lg"}
          opened={selectedVariantOptionModal !== null}
          onClose={() => setSelectedVariantOptionModal(null)}
          centered
          title="Varyant Seçeneği Düzenle"
          classNames={{
            title: "font-semibold text-lg",
          }}
        >
          <Tabs defaultValue={"color"}>
            <Tabs.List grow>
              <Tabs.Tab value="color">Renk</Tabs.Tab>
              <Tabs.Tab value="image">Görsel</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="color" pt="lg">
              <Controller
                control={control}
                name={`options.${selectedVariantIndex}.hexValue`}
                render={({ field: { onChange, ...field }, fieldState }) => (
                  <ColorInput
                    {...field}
                    onChangeEnd={(value) => {
                      onChange(value);
                    }}
                    value={field.value || "#ab7676"}
                    withPicker
                    error={fieldState.error?.message}
                    variant="filled"
                    label="Renk"
                    c={"admin"}
                  />
                )}
              />
            </Tabs.Panel>
            <Tabs.Panel value="image" pt="lg">
              <Controller
                control={control}
                name={`options.${selectedVariantIndex}.file`}
                render={({ field, fieldState }) => (
                  <GlobalDropzone
                    accept={"IMAGE"}
                    onDrop={(files) => {
                      field.onChange(files[0]);
                    }}
                    existingImages={
                      fields[selectedVariantIndex]?.existingFile
                        ? [
                            {
                              url: fields[selectedVariantIndex].existingFile,
                              type: "IMAGE",
                            },
                          ]
                        : []
                    }
                    existingImagesDelete={async (imageUrl) => {
                      const fetchRes = await fetchWrapper.delete(
                        `/admin/products/delete-option-asset/${encodeURIComponent(imageUrl)}`
                      );
                      if (!fetchRes.success) {
                        console.warn("Görsel silinirken bir hata oluştu.");
                      } else {
                        const currentOptions = watch("options");
                        const updatedOptions = [...currentOptions];
                        updatedOptions[selectedVariantIndex] = {
                          ...updatedOptions[selectedVariantIndex],
                          existingFile: null,
                        };
                        setValue("options", updatedOptions, {
                          shouldDirty: true,
                        });
                      }
                    }}
                    {...field}
                    value={field.value || []}
                    cols={1}
                    multiple={false}
                    maxFiles={1}
                    error={fieldState.error?.message}
                    maxSize={10 * 1024 * 1024}
                  />
                )}
              />
            </Tabs.Panel>
          </Tabs>
        </Modal>
      )}
    </>
  );
};

export default VariantGroupDrawer;
