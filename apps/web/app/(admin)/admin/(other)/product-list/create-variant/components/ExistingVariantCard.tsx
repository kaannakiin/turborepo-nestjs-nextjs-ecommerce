"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  ColorSwatch,
  Flex,
  Group,
  Input,
  Popover,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Control,
  Controller,
  useFieldArray,
  UseFormSetValue,
} from "@repo/shared";
import { VariantGroupZodType, VariantProductZodType } from "@repo/types";
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconPointFilled,
  IconTrash,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import VariantGroupDrawer from "./VariantGroupDrawer";
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
import { returnCombinateVariant } from "../../../../../../../lib/helpers";
import CombinatedVariantsDropzoneDrawer from "./CombinatedVariantsDropzoneDrawer";
import CombinatedVariantsFormDrawer from "./CombinatedVariantsFormDrawer";
import ProductPriceNumberInput from "./ProductPriceNumberInput";

interface ExistingVariantCardProps {
  control: Control<VariantProductZodType>;
  errors?: string;
  setValue: UseFormSetValue<VariantProductZodType>;
}

interface SortableVariantItemProps {
  id: string;
  field: VariantGroupZodType;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableVariantItem = ({
  id,
  field,
  index,
  onEdit,
  onDelete,
}: SortableVariantItemProps) => {
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // useEffect ekleyin - client-side'da mount olduğunu kontrol için
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <div ref={setNodeRef} style={style}>
      <Group
        align="flex-start"
        justify="space-between"
        p="sm"
        bg={isDragging ? "gray.1" : "white"}
        style={{
          borderRadius: "8px",
          border: "1px solid var(--mantine-color-gray-3)",
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        <Group
          gap={"md"}
          align="center"
          justify="flex-start"
          style={{ flexShrink: 0 }}
        >
          {/* Sadece client-side'da DnD handle'ı render et */}
          {isMounted ? (
            <ActionIcon
              variant="transparent"
              size={"sm"}
              style={{ cursor: "grab" }}
              {...attributes}
              {...listeners}
            >
              <IconDotsVertical stroke={2} />
            </ActionIcon>
          ) : (
            // Server-side için placeholder
            <ActionIcon
              variant="transparent"
              size={"sm"}
              style={{ cursor: "default" }}
            >
              <IconDotsVertical stroke={2} />
            </ActionIcon>
          )}

          {index === 0 && (
            <Text fw={700} fz={"xs"} c={"dimmed"}>
              (Ana Seçenek)
            </Text>
          )}
          <Text fw={700} fz={"sm"} tt={"capitalize"}>
            {field.translations.find(
              (translation) => translation.locale === "TR"
            )?.name || field.translations[0]?.name}
          </Text>
        </Group>

        <Flex
          gap={4}
          align="center"
          wrap="wrap"
          justify="center"
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          {field?.options &&
            field.options.map((option, optionIndex) => {
              const optionName =
                option.translations.find(
                  (translation) => translation.locale === "TR"
                )?.name || option.translations[0]?.name;

              return (
                <Flex key={option.uniqueId} gap={4} align="center">
                  {field.type === "LIST" ? (
                    <Text
                      size="sm"
                      fw={500}
                      c="dimmed"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {optionName}
                    </Text>
                  ) : option.file ? (
                    <Group gap={6} align="center" style={{ flexShrink: 0 }}>
                      <Avatar
                        src={URL.createObjectURL(option.file)}
                        radius={4}
                        size={20}
                      />
                      <Text
                        size="sm"
                        fw={500}
                        c="dimmed"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {optionName}
                      </Text>
                    </Group>
                  ) : option.existingFile ? (
                    <Group gap={6} align="center" style={{ flexShrink: 0 }}>
                      <Avatar radius={4} size={20} src={option.existingFile} />
                      <Text
                        size="sm"
                        fw={500}
                        c="dimmed"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {optionName}
                      </Text>
                    </Group>
                  ) : (
                    <Group gap={6} align="center" style={{ flexShrink: 0 }}>
                      <ColorSwatch
                        size={16}
                        color={option.hexValue || "#000"}
                      />
                      <Text
                        size="sm"
                        fw={500}
                        c="dimmed"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {optionName}
                      </Text>
                    </Group>
                  )}

                  {optionIndex < field.options.length - 1 && (
                    <IconPointFilled
                      size={8}
                      style={{
                        color: "var(--mantine-color-gray-5)",
                        marginLeft: "4px",
                        marginRight: "4px",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Flex>
              );
            })}
        </Flex>

        <Group gap={"md"} style={{ flexShrink: 0 }}>
          <ActionIcon variant="transparent" onClick={onEdit}>
            <IconEdit />
          </ActionIcon>

          <Popover
            position="top"
            withArrow
            shadow="md"
            opened={deletePopoverOpened}
            onChange={setDeletePopoverOpened}
          >
            <Popover.Target>
              <ActionIcon
                variant="transparent"
                color="red"
                onClick={() => setDeletePopoverOpened(true)}
              >
                <IconTrash />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap="xs" w={220}>
                <Text size="sm" ta="start">
                  Bu varyantı silmek istediğinize emin misiniz?
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

const ExistingVariantCard = ({
  control,
  errors,
  setValue,
}: ExistingVariantCardProps) => {
  const [opened, { close, open }] = useDisclosure();
  const [selectedExistingVariant, setSelectedExistingVariant] = useState<
    string | null
  >(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [bulkUpdateValues, setBulkUpdateValues] = useState<{
    price: VariantProductZodType["combinatedVariants"][number]["prices"][number]["price"];
    discountPrice: VariantProductZodType["combinatedVariants"][number]["prices"][number]["discountPrice"];
    buyedPrice: VariantProductZodType["combinatedVariants"][number]["prices"][number]["buyedPrice"];
    sku: VariantProductZodType["combinatedVariants"][number]["sku"];
    barcode: VariantProductZodType["combinatedVariants"][number]["barcode"];
    stock: VariantProductZodType["combinatedVariants"][number]["stock"];
  }>({
    price: 0,
    discountPrice: 0,
    buyedPrice: 0,
    sku: "",
    barcode: "",
    stock: 0,
  });

  const [dropzoneOpened, { close: closeDropzone, open: openDropzone }] =
    useDisclosure();

  const [
    openedBottomVariantCombinatedDrawer,
    {
      close: closeBottomVariantCombinatedDrawer,
      open: openBottomVariantCombinatedDrawer,
    },
  ] = useDisclosure();

  const [dropzoneSelectedIndex, setDropzoneSelectedIndex] = useState<number>(0);

  const { fields, append, remove, update, move } = useFieldArray({
    control,
    name: "existingVariants",
  });
  const {
    fields: combinatedFields,
    replace: combinatedReplace,
    update: combinatedUpdate,
  } = useFieldArray({
    control,
    name: "combinatedVariants",
  });

  const hasVariants = fields.length > 0;
  const hasCombinatedVariants = combinatedFields.length > 0;

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over?.id);
      move(oldIndex, newIndex);
    }
  };

  // Combination yenileme fonksiyonu
  const regenerateCombinations = useCallback(
    (updatedVariants: typeof fields) => {
      const newCombinations = returnCombinateVariant({
        existingVariants: updatedVariants,
        existingCombinatedVariants: combinatedFields,
      });
      combinatedReplace(newCombinations);
      setSelectedRows(new Set());
    },
    [combinatedFields, combinatedReplace]
  );

  const getVariantOptionNames = (
    variantIds: { variantGroupId: string; variantOptionId: string }[]
  ): string[] => {
    return variantIds.map((variantId) => {
      const field = fields.find(
        (field) => field.uniqueId === variantId.variantGroupId
      );
      if (field) {
        const option = field.options.find(
          (opt) => opt.uniqueId === variantId.variantOptionId
        );
        if (option) {
          return (
            option.translations.find((t) => t.locale === "TR")?.name ||
            option.translations[0]?.name ||
            ""
          );
        }
      }
      return "";
    });
  };

  // Checkbox handlers
  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(
          new Set(Array.from({ length: combinatedFields.length }, (_, i) => i))
        );
      } else {
        setSelectedRows(new Set());
      }
    },
    [combinatedFields.length]
  );

  const handleRowSelectionChange = useCallback(
    (index: number, checked: boolean) => {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(index);
        } else {
          newSet.delete(index);
        }
        return newSet;
      });
    },
    []
  );

  const isAllSelected = useMemo(
    () =>
      combinatedFields.length > 0 &&
      selectedRows.size === combinatedFields.length,
    [selectedRows.size, combinatedFields.length]
  );

  const isIndeterminate = useMemo(
    () => selectedRows.size > 0 && selectedRows.size < combinatedFields.length,
    [selectedRows.size, combinatedFields.length]
  );

  const handleBulkUpdate = useCallback(
    (field: keyof typeof bulkUpdateValues, value: string) => {
      setBulkUpdateValues((prev) => ({ ...prev, [field]: value }));

      selectedRows.forEach((index) => {
        const currentVariant = combinatedFields[index];
        if (currentVariant) {
          if (field === "stock") {
            const numericValue = value ? parseFloat(value) : 0;
            if (!isNaN(numericValue)) {
              combinatedUpdate(index, {
                ...currentVariant,
                stock: numericValue,
              });
            }
          } else if (
            field === "price" ||
            field === "discountPrice" ||
            field === "buyedPrice"
          ) {
            const numericValue = value ? parseFloat(value) : null;
            if (!isNaN(numericValue!) || value === "") {
              combinatedUpdate(index, {
                ...currentVariant,
                prices: currentVariant.prices.map((price, priceIndex) =>
                  priceIndex === 0
                    ? {
                        ...price,
                        [field]:
                          field === "price" && value !== ""
                            ? numericValue
                            : field !== "price"
                              ? value === ""
                                ? null
                                : numericValue
                              : price[field],
                      }
                    : price
                ),
              });
            }
          } else {
            combinatedUpdate(index, {
              ...currentVariant,
              [field]: value,
            });
          }
        }
      });
    },
    [selectedRows, combinatedFields, combinatedUpdate]
  );

  const handleVariantDelete = useCallback(
    (index: number) => {
      const updatedFields = fields.filter((_, i) => i !== index);
      remove(index);
      regenerateCombinations(updatedFields);
    },
    [fields, remove, regenerateCombinations]
  );

  const handleDropzoneOpen = useCallback(
    (index: number) => {
      setDropzoneSelectedIndex(index);
      openDropzone();
    },
    [openDropzone]
  );

  return (
    <>
      <Card withBorder p={"lg"} radius="md">
        {hasVariants ? (
          <Card.Section inheritPadding className="border-b">
            <Group justify="space-between" align="center">
              <Title order={4} py={"md"}>
                Varyant
              </Title>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedExistingVariant(null);
                  open();
                }}
                leftSection={<IconPlus size={16} />}
              >
                Varyant Ekle
              </Button>
            </Group>
          </Card.Section>
        ) : (
          <Card.Section inheritPadding className="border-b">
            <Stack gap={"xs"} py={"md"}>
              <Title order={4}>Varyant</Title>
              {errors && <Input.Error>{errors}</Input.Error>}
            </Stack>
          </Card.Section>
        )}

        {!hasVariants && (
          <Stack align="center" py="xl" gap={"xs"}>
            <Title order={4}>
              Henüz bir varyant eklemediniz. Varyant eklemek için butona
              tıklayın.
            </Title>
            <Text>Renk, boyut gibi ürün varyantı ekleyiniz.</Text>
            <Button
              size="md"
              variant="filled"
              onClick={() => {
                setSelectedExistingVariant(null);
                open();
              }}
              leftSection={<IconPlus size={18} />}
            >
              Varyant Ekle
            </Button>
          </Stack>
        )}

        {hasVariants && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack gap="md" mt="md">
                {fields.map((field, index) => (
                  <SortableVariantItem
                    key={field.id}
                    id={field.id}
                    field={field}
                    index={index}
                    onEdit={() => {
                      setSelectedExistingVariant(field.id);
                      open();
                    }}
                    onDelete={() => handleVariantDelete(index)}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}

        {hasCombinatedVariants && (
          <Box mt="md">
            <Table.ScrollContainer minWidth={1200}>
              <Table
                highlightOnHover
                highlightOnHoverColor="admin.1"
                verticalSpacing="sm"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={(event) =>
                          handleSelectAllChange(event.currentTarget.checked)
                        }
                      />
                    </Table.Th>
                    <Table.Th className="flex items-start">Varyant</Table.Th>
                    <Table.Th>
                      Satış Fiyatı
                      {selectedRows.size > 0 && (
                        <ProductPriceNumberInput
                          size="xs"
                          placeholder="Toplu güncelle"
                          value={bulkUpdateValues.price}
                          onChange={(value) =>
                            handleBulkUpdate("price", value?.toString() || "")
                          }
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </Table.Th>
                    <Table.Th>
                      İndirimli Fiyat
                      {selectedRows.size > 0 && (
                        <ProductPriceNumberInput
                          size="xs"
                          placeholder="Toplu güncelle"
                          value={bulkUpdateValues.discountPrice || undefined}
                          onChange={(value) =>
                            handleBulkUpdate(
                              "discountPrice",
                              value?.toString() || ""
                            )
                          }
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </Table.Th>
                    <Table.Th>
                      Alış Fiyatı
                      {selectedRows.size > 0 && (
                        <ProductPriceNumberInput
                          size="xs"
                          placeholder="Toplu güncelle"
                          value={bulkUpdateValues.buyedPrice || undefined}
                          onChange={(value) =>
                            handleBulkUpdate(
                              "buyedPrice",
                              value?.toString() || ""
                            )
                          }
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </Table.Th>
                    <Table.Th>
                      SKU
                      {selectedRows.size > 0 && (
                        <TextInput
                          size="xs"
                          placeholder="Toplu güncelle"
                          value={bulkUpdateValues.sku}
                          onChange={(event) =>
                            handleBulkUpdate("sku", event.currentTarget.value)
                          }
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </Table.Th>
                    <Table.Th>
                      Barkod
                      {selectedRows.size > 0 && (
                        <TextInput
                          size="xs"
                          placeholder="Toplu güncelle"
                          value={bulkUpdateValues.barcode}
                          onChange={(event) =>
                            handleBulkUpdate(
                              "barcode",
                              event.currentTarget.value
                            )
                          }
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </Table.Th>
                    <Table.Th>
                      Stok
                      {selectedRows.size > 0 && (
                        <ProductPriceNumberInput
                          size="xs"
                          placeholder="Toplu güncelle"
                          value={bulkUpdateValues.stock}
                          onChange={(event) =>
                            handleBulkUpdate("stock", event?.toString() || "")
                          }
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {combinatedFields.map((field, index) => (
                    <Table.Tr
                      key={field.id}
                      onClick={() => {
                        setDropzoneSelectedIndex(index);
                        openBottomVariantCombinatedDrawer();
                      }}
                    >
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Group gap="xs" align="center" wrap="nowrap">
                          <Checkbox
                            checked={selectedRows.has(index)}
                            onChange={(event) =>
                              handleRowSelectionChange(
                                index,
                                event.currentTarget.checked
                              )
                            }
                          />
                          <ActionIcon
                            radius="sm"
                            size="lg"
                            color="gray"
                            variant="light"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDropzoneOpen(index);
                            }}
                          >
                            <IconPlus size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Flex gap={4} wrap="wrap">
                          {getVariantOptionNames(field.variantIds).map(
                            (name, badgeIndex) => (
                              <Badge
                                key={badgeIndex}
                                variant="light"
                                size="md"
                                radius={"0"}
                              >
                                {name}
                              </Badge>
                            )
                          )}
                        </Flex>
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Controller
                          control={control}
                          name={`combinatedVariants.${index}.prices.0.price`}
                          render={({ field, fieldState }) => (
                            <ProductPriceNumberInput
                              {...field}
                              error={fieldState.error?.message}
                              size="sm"
                            />
                          )}
                        />
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Controller
                          control={control}
                          name={`combinatedVariants.${index}.prices.0.discountPrice`}
                          render={({ field, fieldState }) => (
                            <ProductPriceNumberInput
                              error={fieldState.error?.message}
                              {...field}
                              value={field.value || undefined}
                              size="sm"
                            />
                          )}
                        />
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Controller
                          control={control}
                          name={`combinatedVariants.${index}.prices.0.buyedPrice`}
                          render={({ field, fieldState }) => (
                            <ProductPriceNumberInput
                              error={fieldState.error?.message}
                              {...field}
                              value={field.value || undefined}
                              size="sm"
                            />
                          )}
                        />
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Controller
                          control={control}
                          name={`combinatedVariants.${index}.sku`}
                          render={({ field, fieldState }) => (
                            <TextInput
                              error={fieldState.error?.message}
                              {...field}
                              value={field.value || undefined}
                              size="sm"
                            />
                          )}
                        />
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Controller
                          control={control}
                          name={`combinatedVariants.${index}.barcode`}
                          render={({ field, fieldState }) => (
                            <TextInput
                              error={fieldState.error?.message}
                              {...field}
                              value={field.value || undefined}
                              size="sm"
                            />
                          )}
                        />
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Controller
                          control={control}
                          name={`combinatedVariants.${index}.stock`}
                          render={({ field, fieldState }) => (
                            <ProductPriceNumberInput
                              error={fieldState.error?.message}
                              {...field}
                              value={field.value || undefined}
                              size="sm"
                            />
                          )}
                        />
                      </Table.Td>
                      <Table.Td
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Controller
                          control={control}
                          name={`combinatedVariants.${index}.active`}
                          render={({ field: { value, ...field } }) => (
                            <Switch
                              {...field}
                              checked={value}
                              label={value ? "Aktif" : "Pasif"}
                            />
                          )}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Box>
        )}
      </Card>

      <VariantGroupDrawer
        key={
          selectedExistingVariant
            ? fields.find((field) => field.id === selectedExistingVariant)?.id
            : "new"
        }
        defaultValues={
          selectedExistingVariant
            ? fields.find((field) => field.id === selectedExistingVariant)
            : undefined
        }
        onSubmit={(data) => {
          const dataWithId = { ...data, id: data.uniqueId };

          if (selectedExistingVariant) {
            const index = fields.findIndex(
              (f) => f.id === selectedExistingVariant
            );
            if (index !== -1) {
              update(index, dataWithId);
              regenerateCombinations([
                ...fields.slice(0, index),
                dataWithId,
                ...fields.slice(index + 1),
              ]);
            }
          } else {
            append(dataWithId);
            regenerateCombinations([...fields, dataWithId]);
          }

          setSelectedExistingVariant(null);
          close();
        }}
        opened={opened}
        onClose={() => {
          setSelectedExistingVariant(null);
          close();
        }}
      />

      <CombinatedVariantsDropzoneDrawer
        control={control}
        fields={combinatedFields}
        update={combinatedUpdate}
        onClose={closeDropzone}
        opened={dropzoneOpened}
        selectedIndex={dropzoneSelectedIndex}
        selectedIndexs={Array.from(selectedRows)}
      />
      <CombinatedVariantsFormDrawer
        opened={openedBottomVariantCombinatedDrawer}
        onClose={() => {
          closeBottomVariantCombinatedDrawer();
        }}
        selectedIndex={dropzoneSelectedIndex} // Bu satırı ekle
        control={control}
        setValue={setValue}
      />
    </>
  );
};

export default ExistingVariantCard;
