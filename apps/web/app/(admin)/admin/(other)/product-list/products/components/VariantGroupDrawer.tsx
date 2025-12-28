"use client";
import GlobalDropzone from "@/components/GlobalDropzone";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  ColorInput,
  ColorSwatch,
  Combobox,
  Drawer,
  DrawerProps,
  Group,
  InputError,
  Modal,
  Popover,
  Radio,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  UnstyledButton,
  useCombobox,
} from "@mantine/core";
import {
  Control,
  Controller,
  createId,
  slugify,
  SubmitHandler,
  useFieldArray,
  useForm,
  useQuery,
  useWatch,
  zodResolver,
} from "@repo/shared";
import { VariantGroupSchema, VariantGroupZodType } from "@repo/types";
import {
  IconChevronDown,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  VariantGroupRenderType,
  VariantGroupType,
} from "@repo/database/client";
import CreatableSelect from "./CreatableSelect";

interface VariantGroupDrawerProps
  extends Pick<DrawerProps, "opened" | "onClose"> {
  onSubmit: SubmitHandler<VariantGroupZodType>;
  defaultValues?: VariantGroupZodType;
  errorMessage?: string;
}

type VariantOption = VariantGroupZodType["options"][number];
type DeletedVariant = Omit<VariantOption, "id">;

interface SortableVariantItemProps {
  id: string;
  index: number;
  control: Control<VariantGroupZodType>;
  onEdit: () => void;
  onDelete: () => void;
  type: VariantGroupType;
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
  errorMessage,
}: VariantGroupDrawerProps) => {
  const [variantError, setVariantError] = useState<string | null>(null);
  const optionCombobox = useCombobox({
    onDropdownClose: () => optionCombobox.resetSelectedOption(),
  });
  const [variantName, setVariantName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedVariantOptionModal, setSelectedVariantOptionModal] = useState<
    string | null
  >(null);
  const [allDeleteVariantPopover, setAllDeleteVariantPopover] = useState(false);

  const [deletedVariants, setDeletedVariants] = useState<DeletedVariant[]>([]);

  const { data: allVariants, isLoading } = useQuery({
    queryKey: ["variants"],
    queryFn: async (): Promise<VariantGroupZodType[]> => {
      const response = await fetchWrapper.get<VariantGroupZodType[]>(
        `/admin/products/variants`
      );
      if (!response.success) {
        throw new Error("Failed to fetch variants");
      }

      return response.data;
    },
  });

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
    if (!opened) return;

    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset(initialValues);
    }
    setDeletedVariants([]);
    setVariantName("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

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

    const trimmedName = variantName.trim();
    const trimmedSlug = slugify(trimmedName);

    const existsInForm = fields.some((field) => {
      const slug = field.translations?.find((t) => t.locale === "TR")?.slug;
      return slug === trimmedSlug;
    });

    if (existsInForm) {
      setVariantError("Bu varyant zaten eklendi");
      setTimeout(() => setVariantError(null), 2000);
      return;
    }

    const existingOption = existingGroupOptions.find((opt) => {
      const slug = opt.translations?.find((t) => t.locale === "TR")?.slug;
      return slug === trimmedSlug;
    });

    if (existingOption) {
      append({
        uniqueId: existingOption.uniqueId,
        translations: existingOption.translations,
        hexValue: existingOption.hexValue || "#000000",
        file: null,
        existingFile: existingOption.existingFile,
      });
    } else {
      append({
        uniqueId: createId(),
        translations: [
          {
            name: trimmedName,
            locale: "TR",
            slug: trimmedSlug,
          },
        ],
        hexValue: "#000000",
        file: null,
        existingFile: null,
      });
    }

    setVariantName("");
    setVariantError(null);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSelectExistingOption = (optionId: string) => {
    const existing = existingGroupOptions.find((o) => o.uniqueId === optionId);
    if (!existing) return;

    if (addedOptionIds.has(existing.uniqueId)) {
      setVariantError("Bu varyant zaten eklendi");
      setTimeout(() => setVariantError(null), 2000);
      return;
    }

    append({
      uniqueId: existing.uniqueId,
      translations: existing.translations,
      hexValue: existing.hexValue || "#000000",
      file: null,
      existingFile: existing.existingFile,
    });

    setVariantName("");
    setVariantError(null);

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

  const existingGroupOptions = useMemo(() => {
    if (!allVariants || !uniqueId) return [];

    const group = allVariants.find((v) => v.uniqueId === uniqueId);
    return group?.options || [];
  }, [allVariants, uniqueId]);

  const addedOptionIds = useMemo(() => {
    return new Set(fields.map((f) => f.uniqueId));
  }, [fields]);

  const optionSuggestions = useMemo(() => {
    if (!existingGroupOptions.length) return [];

    const trimmed = variantName.trim();
    if (!trimmed) {
      return existingGroupOptions.filter(
        (opt) => !addedOptionIds.has(opt.uniqueId)
      );
    }

    const trimmedLower = trimmed.toLowerCase();
    const trimmedSlug = slugify(trimmed);

    return existingGroupOptions.filter((opt) => {
      if (addedOptionIds.has(opt.uniqueId)) return false;

      const name = opt.translations?.find((t) => t.locale === "TR")?.name || "";
      const slug = opt.translations?.find((t) => t.locale === "TR")?.slug || "";

      return (
        name.toLowerCase().includes(trimmedLower) || slug.includes(trimmedSlug)
      );
    });
  }, [variantName, existingGroupOptions, addedOptionIds]);

  const exactOptionMatch = useMemo(() => {
    if (!variantName.trim()) return null;

    const trimmedSlug = slugify(variantName.trim());

    const inForm = fields.find((f) => {
      const slug = f.translations?.find((t) => t.locale === "TR")?.slug;
      return slug === trimmedSlug;
    });

    if (inForm) return { type: "form" as const, option: inForm };

    const inDb = existingGroupOptions.find((opt) => {
      const slug = opt.translations?.find((t) => t.locale === "TR")?.slug;
      return slug === trimmedSlug;
    });

    if (inDb) return { type: "db" as const, option: inDb };

    return null;
  }, [variantName, fields, existingGroupOptions]);
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
                    isLoading={isLoading}
                    allVariants={allVariants}
                    data-autofocus={!defaultValues}
                  />
                )}
              />
              {errorMessage && <InputError>{errorMessage}</InputError>}
              <Stack gap={"xs"}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field, fieldState }) => {
                    return (
                      <Radio.Group
                        {...field}
                        onChange={(value) => {
                          field.onChange(value as VariantGroupType);
                        }}
                        error={fieldState.error?.message}
                        label="Seçim Stili"
                        withAsterisk
                      >
                        <SimpleGrid cols={{ xs: 1, sm: 2 }} pt={"2px"}>
                          <Radio.Card
                            value={VariantGroupType.LIST}
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
                            value={VariantGroupType.COLOR}
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
                        field.onChange(value as VariantGroupRenderType);
                      }}
                      error={fieldState.error?.message}
                      label="Gösterim Şekli"
                      withAsterisk
                      mt="md"
                    >
                      <SimpleGrid cols={{ xs: 1, sm: 2 }} pt={"2px"}>
                        <Radio.Card
                          value={VariantGroupRenderType.BADGE}
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
                          value={VariantGroupRenderType.DROPDOWN}
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

              <Combobox
                store={optionCombobox}
                onOptionSubmit={(val) => {
                  if (val === "$create") {
                    handleAddVariant();
                  } else {
                    handleSelectExistingOption(val);
                  }
                  optionCombobox.closeDropdown();
                }}
              >
                <Combobox.Target>
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
                                  onClick={() =>
                                    setAllDeleteVariantPopover(true)
                                  }
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
                              {deletedVariants.length} silinen varyantı geri
                              getir
                            </Button>
                          )}
                        </Stack>
                      </Group>
                    }
                    placeholder="Varyant seçeneği ara veya oluştur..."
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    value={variantName}
                    onChange={(e) => {
                      setVariantName(e.currentTarget.value);
                      optionCombobox.openDropdown();
                      optionCombobox.updateSelectedOptionIndex();
                    }}
                    onClick={() => optionCombobox.openDropdown()}
                    onFocus={() => optionCombobox.openDropdown()}
                    onBlur={() => optionCombobox.closeDropdown()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddVariant();
                        optionCombobox.closeDropdown();
                      }
                    }}
                    error={variantError || errors.options?.message || undefined}
                    variant="filled"
                  />
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>
                    {isLoading && (
                      <Combobox.Option value="" disabled>
                        Yükleniyor...
                      </Combobox.Option>
                    )}

                    {!isLoading && optionSuggestions.length > 0 && (
                      <Combobox.Group label="Mevcut Seçenekler">
                        {optionSuggestions.map((opt) => {
                          const name =
                            opt.translations?.find((t) => t.locale === "TR")
                              ?.name || "";
                          return (
                            <Combobox.Option
                              key={opt.uniqueId}
                              value={opt.uniqueId}
                            >
                              <Group gap="xs">
                                {opt.hexValue && (
                                  <ColorSwatch color={opt.hexValue} size={16} />
                                )}
                                <span>{name}</span>
                                <Badge size="xs" variant="light" color="gray">
                                  mevcut
                                </Badge>
                              </Group>
                            </Combobox.Option>
                          );
                        })}
                      </Combobox.Group>
                    )}

                    {!isLoading && variantName.trim() && !exactOptionMatch && (
                      <Combobox.Option value="$create">
                        <Group gap="xs">
                          <IconPlus size={16} />
                          <span>&quot;{variantName.trim()}&quot; oluştur</span>
                        </Group>
                      </Combobox.Option>
                    )}

                    {!isLoading &&
                      variantName.trim() &&
                      exactOptionMatch?.type === "db" &&
                      !addedOptionIds.has(exactOptionMatch.option.uniqueId) && (
                        <Combobox.Option
                          value={exactOptionMatch.option.uniqueId}
                        >
                          <Group gap="xs">
                            {exactOptionMatch.option.hexValue && (
                              <ColorSwatch
                                color={exactOptionMatch.option.hexValue}
                                size={16}
                              />
                            )}
                            <span>
                              {
                                exactOptionMatch.option.translations?.find(
                                  (t) => t.locale === "TR"
                                )?.name
                              }
                            </span>
                            <Badge size="xs" variant="light" color="blue">
                              ekle
                            </Badge>
                          </Group>
                        </Combobox.Option>
                      )}

                    {!isLoading &&
                      variantName.trim() &&
                      exactOptionMatch?.type === "form" && (
                        <Combobox.Option value="" disabled>
                          <Text size="sm" c="red">
                            Bu varyant zaten eklendi
                          </Text>
                        </Combobox.Option>
                      )}

                    {!isLoading &&
                      !variantName.trim() &&
                      optionSuggestions.length === 0 &&
                      existingGroupOptions.length === 0 && (
                        <Combobox.Option value="" disabled>
                          Varyant adı yazın...
                        </Combobox.Option>
                      )}

                    {!isLoading &&
                      !variantName.trim() &&
                      existingGroupOptions.length > 0 &&
                      optionSuggestions.length === 0 && (
                        <Combobox.Option value="" disabled>
                          Tüm mevcut seçenekler eklendi
                        </Combobox.Option>
                      )}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
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
