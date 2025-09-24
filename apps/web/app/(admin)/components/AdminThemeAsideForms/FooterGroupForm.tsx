"use client";
import {
  ActionIcon,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  Card,
  Button,
  Badge,
  Box,
} from "@mantine/core";
import {
  Controller,
  createId,
  SubmitHandler,
  useFieldArray,
  useForm,
  zodResolver,
} from "@repo/shared";
import {
  FooterLinkGroupSchema,
  FooterLinkGroupType,
  FooterLinkType,
} from "@repo/types";
import {
  IconPlus,
  IconEdit,
  IconGripVertical,
  IconTrash,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FooterLinkForm from "./FooterLinkForm";

interface FooterGroupFormProps {
  defaultValues?: FooterLinkGroupType;
  onSubmit: SubmitHandler<FooterLinkGroupType>;
}

type FormType = "add" | "edit" | "normal";

// Sortable Link Item Component
interface SortableLinkItemProps {
  link: FooterLinkType & { order: number };
  index: number;
  onEdit: (link: FooterLinkType & { order: number }) => void;
  onDelete: (index: number) => void;
}

const SortableLinkItem = ({
  link,
  index,
  onEdit,
  onDelete,
}: SortableLinkItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.uniqueId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Link tipini belirle
  const getLinkType = () => {
    if (link.customLink) return { type: "Özel", value: link.customLink };
    if (link.productId) return { type: "Ürün", value: link.productId };
    if (link.categoryId) return { type: "Kategori", value: link.categoryId };
    if (link.brandId) return { type: "Marka", value: link.brandId };
    return { type: "Bilinmiyor", value: "" };
  };

  const linkInfo = getLinkType();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      shadow="xs"
      padding="xs"
      radius="md"
      withBorder
    >
      <Group justify="space-between" align="center">
        <Group flex={1} gap="xs">
          <Box
            {...attributes}
            {...listeners}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <IconGripVertical size={16} />
          </Box>

          <Stack gap={2} flex={1}>
            <Group justify="space-between">
              <Text fw={500} size="sm" truncate>
                {link.title}
              </Text>
              <Badge size="xs" variant="light">
                #{link.order + 1}
              </Badge>
            </Group>

            <Group gap="xs">
              <Badge size="xs" variant="outline">
                {linkInfo.type}
              </Badge>
              {linkInfo.type === "Özel" && (
                <Text size="xs" c="dimmed" truncate maw={200}>
                  {linkInfo.value}
                </Text>
              )}
            </Group>
          </Stack>
        </Group>

        <Group gap="xs">
          <Tooltip label="Düzenle">
            <ActionIcon variant="light" size="sm" onClick={() => onEdit(link)}>
              <IconEdit size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Sil">
            <ActionIcon
              variant="light"
              size="sm"
              color="red"
              onClick={() => onDelete(index)}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
};

const FooterGroupForm = ({ defaultValues, onSubmit }: FooterGroupFormProps) => {
  const [type, setType] = useState<FormType>("normal");
  const [editingLink, setEditingLink] = useState<
    (FooterLinkType & { order: number }) | null
  >(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FooterLinkGroupType>({
    resolver: zodResolver(FooterLinkGroupSchema),
    defaultValues: defaultValues || {
      uniqueId: createId(),
      fontSize: "md",
      title: "",
      links: [],
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "links",
  });

  const title = watch("title") || null;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag end handler - React Hook Form move fonksiyonu ile
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(
        (field) => field.uniqueId === active.id
      );
      const newIndex = fields.findIndex((field) => field.uniqueId === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // React Hook Form'un built-in move fonksiyonunu kullan
        move(oldIndex, newIndex);

        // Order'ları yeniden hesapla ve güncelle
        setTimeout(() => {
          fields.forEach((_, index) => {
            update(index, { ...fields[index], order: index });
          });
        }, 0);
      }
    }
  };

  const handleEdit = (link: FooterLinkType & { order: number }) => {
    setEditingLink(link);
    setType("edit");
  };

  // Delete handler - Basitleştirilmiş versiyon
  const handleDelete = (index: number) => {
    remove(index);

    // Silme işleminden sonra order'ları otomatik güncelle
    setTimeout(() => {
      const remainingFields = fields.filter((_, idx) => idx !== index);
      remainingFields.forEach((_, idx) => {
        update(idx, { ...remainingFields[idx], order: idx });
      });
    }, 0);
  };

  const handleFormSubmit = (data: FooterLinkType) => {
    if (type === "edit" && editingLink) {
      const existingIndex = fields.findIndex(
        (f) => f.uniqueId === editingLink.uniqueId
      );
      if (existingIndex !== -1) {
        update(existingIndex, {
          ...data,
          order: editingLink.order,
        });
      }
    } else {
      const isExisting = fields.findIndex((f) => f.uniqueId === data.uniqueId);
      if (isExisting !== -1) {
        update(isExisting, {
          order: fields[isExisting].order,
          ...data,
        });
      } else {
        append({ order: fields.length, ...data });
      }
    }

    setType("normal");
    setEditingLink(null);
  };

  const handleCancel = () => {
    setType("normal");
    setEditingLink(null);
  };

  return (
    <Stack gap="md">
      {type === "normal" ? (
        <>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                error={fieldState.error?.message}
                label="Grup Başlığı"
                withAsterisk
                size="sm"
              />
            )}
          />

          {errors && errors.links && (
            <Text c="red" size="sm">
              {errors.links.message}
            </Text>
          )}

          <Group justify="space-between" align="center">
            {title && <Title order={5}>{title}</Title>}

            <Group gap="xs">
              <Button
                variant="light"
                size="sm"
                leftSection={<IconPlus size={14} />}
                onClick={() => setType("add")}
              >
                Link Ekle
              </Button>
              <Button size="sm" onClick={handleSubmit(onSubmit)}>
                Kaydet
              </Button>
            </Group>
          </Group>

          {fields && fields.length > 0 ? (
            <Stack gap="sm">
              <Text size="xs" c="dimmed">
                {fields.length} link • Sürükleyerek sıralayın
              </Text>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((field) => field.uniqueId)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack gap="xs">
                    {fields.map((link, index) => (
                      <SortableLinkItem
                        key={link.uniqueId}
                        link={link}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
            </Stack>
          ) : (
            <Card withBorder padding="md" radius="md">
              <Stack align="center" gap="sm">
                <Text c="dimmed" size="sm">
                  Henüz link eklenmemiş
                </Text>
                <Button
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => setType("add")}
                  size="sm"
                >
                  İlk Linki Ekle
                </Button>
              </Stack>
            </Card>
          )}
        </>
      ) : (
        <>
          <Card withBorder padding="sm" radius="md">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={14} />}
                  onClick={handleCancel}
                  size="sm"
                >
                  Geri
                </Button>
                <Text size="sm" c="dimmed">
                  {type === "add" ? "Yeni Link" : "Link Düzenle"}
                </Text>
              </Group>

              <FooterLinkForm
                defaultValues={editingLink || undefined}
                onSubmit={handleFormSubmit}
                existingLinks={fields}
              />
            </Stack>
          </Card>
        </>
      )}
    </Stack>
  );
};

export default FooterGroupForm;
