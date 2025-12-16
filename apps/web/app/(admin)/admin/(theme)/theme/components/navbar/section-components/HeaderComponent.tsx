"use client";
import AdminBrandDataSelect from "@/components/inputs/AdminBrandDataSelect";
import AdminCategoryDataSelect from "@/components/inputs/AdminCategoryDataSelect";
import AdminTagDataSelect from "@/components/inputs/AdminTagDataSelect";
import IconDropzone from "@/components/inputs/IconDropzone";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ActionIcon,
  Badge,
  Button,
  ColorInput,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  Control,
  Controller,
  createId,
  useFieldArray,
  UseFormReturn,
  useWatch,
} from "@repo/shared";
import {
  AnnouncementInputType,
  HeaderLinkInputType,
  HeaderLinkType,
  SelectOption,
  ThemeInputType,
} from "@repo/types";
import {
  IconArrowLeft,
  IconLink,
  IconPalette,
  IconPlus,
  IconSpeakerphone,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { SortableListRow } from "../../common/SortableListRow";

interface LinksEditorProps {
  control: Control<ThemeInputType>;
  onBack: () => void;
}

const LinksEditor = ({ control, onBack }: LinksEditorProps) => {
  const prefix = `header` as const;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `${prefix}.links`,
  });

  const links = useWatch({
    control,
    name: `${prefix}.links`,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  const selectedBrandIds = (links ?? [])
    .filter((l) => l.type === "brand" && l.brandId)
    .map((l) => l.brandId!);

  const selectedCategoryIds = (links ?? [])
    .filter((l) => l.type === "category" && l.categoryId)
    .map((l) => l.categoryId!);

  const selectedTagIds = (links ?? [])
    .filter((l) => l.type === "tag" && l.tagId)
    .map((l) => l.tagId!);

  const createChangeHandler = (
    type: HeaderLinkType,
    idKey: "brandId" | "categoryId" | "tagId",
    selectedIds: string[]
  ) => {
    return (value: string | string[] | null, options?: SelectOption[]) => {
      if (!Array.isArray(value)) return;

      const removedIds = selectedIds.filter((id) => !value.includes(id));
      removedIds.forEach((id) => {
        const index = fields.findIndex(
          (f) =>
            (f as HeaderLinkInputType).type === type &&
            (f as HeaderLinkInputType)[idKey] === id
        );
        if (index !== -1) remove(index);
      });

      const newIds = value.filter((id) => !selectedIds.includes(id));
      newIds.forEach((id) => {
        const option = options?.find((o) => o.value === id);
        const newLink: HeaderLinkInputType = {
          linkId: createId(),
          type,
          brandId: idKey === "brandId" ? id : null,
          categoryId: idKey === "categoryId" ? id : null,
          tagId: idKey === "tagId" ? id : null,
          customText: null,
          customUrl: null,
          name: option?.label ?? "",
          order: fields.length,
        };
        append(newLink);
      });
    };
  };

  const linkConfig: Record<HeaderLinkType, { color: string; label: string }> = {
    brand: { color: "blue", label: "Marka" },
    category: { color: "green", label: "Kategori" },
    tag: { color: "orange", label: "Etiket" },
    custom: { color: "violet", label: "Özel" },
  };

  return (
    <Stack gap="md">
      <Button
        variant="subtle"
        color="gray"
        size="xs"
        leftSection={<IconArrowLeft size={14} />}
        onClick={onBack}
        justify="start"
      >
        Geri Dön
      </Button>

      <Stack gap="sm">
        <AdminBrandDataSelect
          multiple
          value={selectedBrandIds}
          onChange={createChangeHandler("brand", "brandId", selectedBrandIds)}
        />

        <AdminCategoryDataSelect
          multiple
          value={selectedCategoryIds}
          onChange={createChangeHandler(
            "category",
            "categoryId",
            selectedCategoryIds
          )}
        />

        <AdminTagDataSelect
          multiple
          value={selectedTagIds}
          onChange={createChangeHandler("tag", "tagId", selectedTagIds)}
        />
      </Stack>

      {fields.length > 0 && (
        <>
          <Text size="sm" fw={500} c="dimmed">
            Sıralama ({fields.length} link)
          </Text>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack gap={"4px"}>
                {fields.map((field, index) => {
                  const linkData = (links?.[index] ??
                    field) as HeaderLinkInputType;
                  const { color, label } =
                    linkConfig[linkData.type] ?? linkConfig.custom;

                  return (
                    <SortableListRow
                      key={field.id}
                      id={field.id}
                      onDelete={() => remove(index)}
                    >
                      <Group justify="space-between" wrap="nowrap" gap="xs">
                        <Text size="sm" fw={500} lineClamp={1}>
                          {linkData.name || linkData.customText || "İsimsiz"}
                        </Text>
                        <Badge
                          size="xs"
                          color={color}
                          variant="light"
                          radius="sm"
                        >
                          {label}
                        </Badge>
                      </Group>
                    </SortableListRow>
                  );
                })}
              </Stack>
            </SortableContext>
          </DndContext>
        </>
      )}

      {fields.length === 0 && (
        <Paper p="md" withBorder bg="gray.0" ta="center">
          <Text size="sm" c="dimmed">
            Henüz link eklenmedi. Yukarıdaki seçeneklerden ekleyin.
          </Text>
        </Paper>
      )}
    </Stack>
  );
};

interface SettingsTabProps {
  control: Control<ThemeInputType>;
  onEditLinks: () => void;
}

const SettingsTab = ({ control, onEditLinks }: SettingsTabProps) => {
  const prefix = `header` as const;

  const links = useWatch({
    control,
    name: `${prefix}.links`,
  });

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        Logo
      </Text>
      <Controller
        control={control}
        name={`${prefix}.logo`}
        render={({ field }) => {
          return <IconDropzone multiple={false} {...field} />;
        }}
      />
      <Stack gap="sm">
        <Controller
          control={control}
          name={`${prefix}.config.backgroundColor`}
          render={({ field: { value, onChange, ...field } }) => (
            <ColorInput
              {...field}
              value={value ?? ""}
              onChangeEnd={onChange}
              label="Arka Plan Rengi"
              placeholder="Renk seçiniz"
              format="hex"
            />
          )}
        />

        <Controller
          control={control}
          name={`${prefix}.config.textColor`}
          render={({ field: { value, onChange, ...field } }) => (
            <ColorInput
              {...field}
              value={value ?? ""}
              onChangeEnd={onChange}
              label="Yazı Rengi"
              placeholder="Renk seçiniz"
              format="hex"
            />
          )}
        />
      </Stack>

      <Group justify="space-between">
        <Badge size="md" variant="outline">
          {links?.length ?? 0} link
        </Badge>
      </Group>

      <Button
        variant="light"
        fullWidth
        leftSection={<IconLink size={16} />}
        onClick={onEditLinks}
      >
        Linkleri Düzenle
      </Button>
    </Stack>
  );
};

interface AnnouncementsTabProps {
  control: Control<ThemeInputType>;
}

const AnnouncementsTab = ({ control }: AnnouncementsTabProps) => {
  const prefix = `header` as const;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `${prefix}.announcements`,
  });

  const announcements = useWatch({
    control,
    name: `${prefix}.announcements`,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  const handleAddAnnouncement = () => {
    if (fields.length >= 10) return;

    const newAnnouncement: AnnouncementInputType = {
      text: "",
      url: "",
      textColor: "#ffffff",
      backgroundColor: "#000000",
    };
    append(newAnnouncement);
  };

  const handleRemove = (index: number, id: string) => {
    remove(index);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const selectedIndex = fields.findIndex((f) => f.id === selectedId);

  return (
    <Stack gap="md">
      {fields.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <Stack gap={0}>
              {fields.map((field, index) => {
                const announcementData = (announcements?.[index] ??
                  field) as AnnouncementInputType;

                const isSelected = field.id === selectedId;

                return (
                  <div
                    key={field.id}
                    onClick={() => setSelectedId(field.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <SortableListRow
                      id={field.id}
                      isSelected={isSelected}
                      onDelete={() => handleRemove(index, field.id)}
                    >
                      <Group justify="space-between" w="100%">
                        <Text size="sm" fw={500} lineClamp={1} c={"dimmed"}>
                          {announcementData.text || `Duyuru ${index + 1}`}
                        </Text>
                      </Group>
                    </SortableListRow>
                  </div>
                );
              })}
            </Stack>
          </SortableContext>
        </DndContext>
      )}

      {fields.length === 0 && (
        <Paper p="md" withBorder bg="gray.0" ta="center">
          <Text size="sm" c="dimmed">
            Henüz duyuru eklenmedi.
          </Text>
        </Paper>
      )}

      <Button
        variant="transparent"
        size="sm"
        color="black"
        onClick={handleAddAnnouncement}
        disabled={fields.length >= 10}
        leftSection={
          <ThemeIcon size="xs" radius="xl" color="black" variant="filled">
            <IconPlus size={14} color="white" />
          </ThemeIcon>
        }
        justify="start"
        fz="xs"
        fw={500}
        px="sm"
        py="xs"
        fullWidth
        className="hover:bg-gray-100"
      >
        Duyuru Ekle {fields.length > 0 && `(${fields.length}/10)`}
      </Button>

      {selectedId && selectedIndex !== -1 && (
        <Paper p="sm" withBorder shadow="sm" radius="md" mt="sm" pos="relative">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            pos="absolute"
            top={5}
            right={5}
            onClick={() => setSelectedId(null)}
          >
            <IconX size={14} />
          </ActionIcon>

          <Stack gap="xs">
            <Text size="xs" fw={700} c="blue">
              Duyuru {selectedIndex + 1}
            </Text>

            <Controller
              control={control}
              name={`${prefix}.announcements.${selectedIndex}.text`}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  size="xs"
                  label="Metin"
                  placeholder="Duyuru metni"
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name={`${prefix}.announcements.${selectedIndex}.url`}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  size="xs"
                  label="URL"
                  placeholder="https://..."
                  error={fieldState.error?.message}
                />
              )}
            />

            <Group grow>
              <Controller
                control={control}
                name={`${prefix}.announcements.${selectedIndex}.backgroundColor`}
                render={({ field: { value, onChange, ...field } }) => (
                  <ColorInput
                    {...field}
                    size="xs"
                    value={value ?? "#000000"}
                    onChangeEnd={onChange}
                    label="Arka Plan"
                    format="hex"
                  />
                )}
              />

              <Controller
                control={control}
                name={`${prefix}.announcements.${selectedIndex}.textColor`}
                render={({ field: { value, onChange, ...field } }) => (
                  <ColorInput
                    {...field}
                    size="xs"
                    value={value ?? "#ffffff"}
                    onChangeEnd={onChange}
                    label="Yazı Rengi"
                    format="hex"
                  />
                )}
              />
            </Group>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

interface HeaderComponentProps {
  forms: UseFormReturn<ThemeInputType>;
}

type View = "main" | "links";

const HeaderComponent = ({ forms: { control } }: HeaderComponentProps) => {
  const [view, setView] = useState<View>("main");

  if (view === "links") {
    return <LinksEditor control={control} onBack={() => setView("main")} />;
  }

  return (
    <Tabs defaultValue="settings" variant="default">
      <Tabs.List grow mb="md">
        <Tabs.Tab value="settings" leftSection={<IconPalette size={14} />}>
          Ayarlar
        </Tabs.Tab>
        <Tabs.Tab
          value="announcements"
          leftSection={<IconSpeakerphone size={14} />}
        >
          Duyurular
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="settings">
        <SettingsTab control={control} onEditLinks={() => setView("links")} />
      </Tabs.Panel>

      <Tabs.Panel value="announcements">
        <AnnouncementsTab control={control} />
      </Tabs.Panel>
    </Tabs>
  );
};

export default HeaderComponent;
