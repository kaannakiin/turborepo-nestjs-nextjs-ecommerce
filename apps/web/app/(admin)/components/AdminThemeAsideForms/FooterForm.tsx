"use client";
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
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  ColorInput,
  Container,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
  zodResolver,
} from "@repo/shared";
import { FooterLinkGroupType, FooterSchema, FooterType } from "@repo/types";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconEdit,
  IconGripVertical,
  IconInfoCircle,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import FooterGroupForm from "./FooterGroupForm";

type DocType = "add" | "edit" | "normal";

// Sortable Group Item Component
interface SortableGroupItemProps {
  group: FooterLinkGroupType & { order: number };
  index: number;
  onEdit: (group: FooterLinkGroupType & { order: number }) => void;
  onDelete: (index: number) => void;
}

const SortableGroupItem = ({
  group,
  index,
  onEdit,
  onDelete,
}: SortableGroupItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.uniqueId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
    >
      <Group justify="space-between" align="flex-start">
        <Group flex={1}>
          <Box
            {...attributes}
            {...listeners}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <IconGripVertical size={18} />
          </Box>

          <Stack gap="xs" flex={1}>
            <Group justify="space-between" align="flex-start">
              <Box>
                <Group gap="xs" align="center">
                  <Text fw={500} size="sm">
                    {group.title}
                  </Text>
                  <Badge size="xs" variant="light">
                    #{group.order + 1}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  Font: {group.fontSize}
                </Text>
              </Box>
            </Group>

            <Group gap="xs" align="center">
              <Badge size="xs" variant="outline">
                {group.links.length} Link
              </Badge>

              {group.links.length > 0 && (
                <Text size="xs" c="dimmed">
                  {group.links
                    .slice(0, 2)
                    .map((link) => link.title)
                    .join(", ")}
                  {group.links.length > 2 && ` +${group.links.length - 2}`}
                </Text>
              )}
            </Group>
          </Stack>
        </Group>

        <Group gap="xs">
          <Tooltip label="Düzenle">
            <ActionIcon variant="light" size="sm" onClick={() => onEdit(group)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Sil">
            <ActionIcon
              variant="light"
              size="sm"
              color="red"
              onClick={() => onDelete(index)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
};
interface FooterFormProps {
  onSubmit: SubmitHandler<FooterType>;
  defaultValues?: FooterType;
}

const FooterForm = ({ onSubmit, defaultValues }: FooterFormProps) => {
  const [docLinkType, setDocLinkType] = useState<DocType>("normal");
  const [editingGroup, setEditingGroup] = useState<
    (FooterLinkGroupType & { order: number }) | null
  >(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FooterType>({
    resolver: zodResolver(FooterSchema),
    defaultValues: defaultValues || {
      linkGroups: [],
      backgroundColor: "#ffffff",
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "linkGroups",
  });
  const backgroundColor = watch("backgroundColor");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag end handler - Çok daha basit yaklaşım
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

  // Edit handler
  const handleEdit = (group: FooterLinkGroupType & { order: number }) => {
    setEditingGroup(group);
    setDocLinkType("edit");
  };

  // Delete handler - Basitleştirilmiş versiyon
  const handleDelete = (index: number) => {
    remove(index);

    // Silme işleminden sonra order'ları otomatik güncelle
    setTimeout(() => {
      fields.forEach((_, idx) => {
        if (idx > index) {
          update(idx - 1, { ...fields[idx], order: idx - 1 });
        }
      });
    }, 0);
  };

  // Group form submit handler
  const handleGroupSubmit = (data: FooterLinkGroupType) => {
    if (docLinkType === "edit" && editingGroup) {
      const existingIndex = fields.findIndex(
        (f) => f.uniqueId === editingGroup.uniqueId
      );
      if (existingIndex !== -1) {
        update(existingIndex, {
          ...data,
          order: editingGroup.order,
        });
      }
    } else {
      const isExisting = fields.findIndex((f) => f.uniqueId === data.uniqueId);
      if (isExisting !== -1) {
        update(isExisting, { order: fields[isExisting].order, ...data });
      } else {
        append({ order: fields.length, ...data });
      }
    }

    setDocLinkType("normal");
    setEditingGroup(null);
  };

  // Cancel handler
  const handleCancel = () => {
    setDocLinkType("normal");
    setEditingGroup(null);
  };

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Box>
            <Title order={3}>Footer Yönetimi</Title>
            <Text c="dimmed" size="sm">
              Footer gruplarını ve linklerini yönetin
            </Text>
          </Box>

          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            disabled={fields.length === 0}
          >
            Kaydet
          </Button>
        </Group>

        {/* Background Color Setting */}
        <Card withBorder padding="sm" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" fw={500}>
              Arka Plan Rengi
            </Text>
            <Text size="xs" c="dimmed">
              {backgroundColor}
            </Text>
          </Group>

          <Controller
            control={control}
            name="backgroundColor"
            render={({ field: { onChange, ...field } }) => (
              <ColorInput
                {...field}
                onChangeEnd={onChange}
                format="hex"
                size="sm"
              />
            )}
          />
        </Card>

        {docLinkType === "normal" ? (
          <>
            {/* Groups List */}
            {fields && fields.length > 0 ? (
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text fw={500}>Footer Grupları</Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => setDocLinkType("add")}
                    size="sm"
                  >
                    Grup Ekle
                  </Button>
                </Group>

                <Alert icon={<IconInfoCircle size={16} />} variant="light">
                  Grupları sürükleyerek sıralayabilirsiniz
                </Alert>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map((field) => field.uniqueId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Stack gap="sm">
                      {fields.map((group, index) => (
                        <SortableGroupItem
                          key={group.uniqueId}
                          group={group}
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
              <Card withBorder padding="lg" radius="md">
                <Stack align="center" gap="sm">
                  <IconInfoCircle size={32} />
                  <Stack align="center" gap="xs">
                    <Text size="sm" fw={500}>
                      Henüz grup eklenmemiş
                    </Text>
                    <Text c="dimmed" ta="center" size="xs">
                      İlk grubu ekleyerek başlayın
                    </Text>
                  </Stack>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => setDocLinkType("add")}
                    size="sm"
                  >
                    İlk Grubu Ekle
                  </Button>
                </Stack>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Group Form */}
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={handleCancel}
                  size="sm"
                >
                  Geri
                </Button>
                <Text size="sm" c="dimmed">
                  {docLinkType === "add" ? "Yeni Grup" : "Grup Düzenle"}
                </Text>
              </Group>

              <FooterGroupForm
                defaultValues={editingGroup || undefined}
                onSubmit={handleGroupSubmit}
              />
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default FooterForm;
