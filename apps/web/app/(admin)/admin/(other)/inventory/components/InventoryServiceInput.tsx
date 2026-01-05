"use client";

import FormCard from "@/components/cards/FormCard";
import CountryInput, {
  CountrySelectData,
} from "@/components/inputs/CountryInput";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Divider,
  Grid,
  Group,
  MultiSelect,
  NumberInput,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CountryType } from "@repo/database/client";
import {
  Control,
  Controller,
  useFieldArray,
  UseFormReturn,
  useWatch,
} from "@repo/shared";
import {
  InventoryLocationZodSchemaType,
  ServiceZoneSchemaType,
} from "@repo/types";
import {
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
  IconPlus,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { Activity, memo, useCallback, useMemo } from "react";
import {
  useCities,
  useCountries,
  useStates,
} from "../../../../../../hooks/useLocations";

interface CountryData {
  id: string;
  name: string;
  emoji: string;
}

interface SortableZoneItemProps {
  field: ServiceZoneSchemaType & { fieldId: string };
  index: number;
  control: Control<InventoryLocationZodSchemaType>;
  setValue: UseFormReturn<InventoryLocationZodSchemaType>["setValue"];
  remove: (index: number) => void;
  countriesData: CountryData[];
}

const SortableZoneItem = memo(
  ({
    field,
    index,
    control,
    setValue,
    remove,
    countriesData,
  }: SortableZoneItemProps) => {
    const [opened, { toggle }] = useDisclosure(false);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: field.fieldId });

    const style = useMemo(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
      }),
      [transform, transition, isDragging]
    );

    const zoneData = useWatch({
      control,
      name: `serviceZones.${index}`,
    });

    const { countryId, countryType, stateIds, cityIds, estimatedDeliveryDays } =
      zoneData || {};

    const { data: states, isLoading: statesLoading } = useStates({
      countryId: countryId || "",
      enabled: !!countryId && countryType === "STATE",
    });

    const { data: cities, isLoading: citiesLoading } = useCities({
      countryId: countryId || "",
      enabled: !!countryId && countryType === "CITY",
    });

    const statesData = useMemo(
      () => states?.map((s) => ({ value: s.id, label: s.name })) || [],
      [states]
    );

    const citiesData = useMemo(
      () => cities?.map((c) => ({ value: c.id, label: c.name })) || [],
      [cities]
    );

    const handleCountryChange = useCallback(
      (selectData: CountrySelectData | null) => {
        if (selectData) {
          setValue(`serviceZones.${index}.countryId`, selectData.value);
          setValue(
            `serviceZones.${index}.countryType`,
            selectData.country.type
          );
          setValue(`serviceZones.${index}.stateIds`, []);
          setValue(`serviceZones.${index}.cityIds`, []);
        }
      },
      [setValue, index]
    );

    const handleRemove = useCallback(() => {
      remove(index);
    }, [remove, index]);

    const countryLabel = useMemo(() => {
      if (!countryId) return "Ülke seçin";
      const country = countriesData.find((c) => c.id === countryId);
      return country ? `${country.emoji} ${country.name}` : "Ülke seçin";
    }, [countryId, countriesData]);

    const subRegionText = useMemo(() => {
      if (countryType === "STATE") {
        if (!stateIds?.length) return "Tüm eyaletler";
        return `${stateIds.length} eyalet seçili`;
      }
      if (countryType === "CITY") {
        if (!cityIds?.length) return "Tüm şehirler";
        return `${cityIds.length} şehir seçili`;
      }
      return "Tüm bölgeler";
    }, [countryType, stateIds, cityIds]);

    return (
      <Card
        ref={setNodeRef}
        style={style}
        withBorder
        radius="md"
        p="sm"
        bg={isDragging ? "gray.1" : "white"}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
              {...attributes}
              {...listeners}
            >
              <IconGripVertical size={18} />
            </ActionIcon>

            <Badge variant="light" color="blue" size="sm">
              #{index + 1}
            </Badge>

            <Group gap="xs">
              <ThemeIcon variant="light" size="sm" color="gray">
                <IconWorld size={14} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={500}>
                  {countryLabel}
                </Text>
                <Text size="xs" c="dimmed">
                  {subRegionText}
                </Text>
              </div>
            </Group>
          </Group>

          <Group gap="xs">
            <ActionIcon variant="subtle" color="red" onClick={handleRemove}>
              <IconTrash size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" onClick={toggle}>
              {opened ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </ActionIcon>
          </Group>
        </Group>

        <Collapse in={opened}>
          <Divider my="sm" />
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                control={control}
                name={`serviceZones.${index}.countryId`}
                render={({ field: f, fieldState }) => (
                  <CountryInput
                    value={f.value}
                    onChange={handleCountryChange}
                    selectProps={{
                      label: "Ülke",
                      placeholder: "Ülke seçin",
                      error: fieldState.error?.message,
                      required: true,
                    }}
                    locale="TR"
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                control={control}
                name={`serviceZones.${index}.estimatedDeliveryDays`}
                render={({ field: f, fieldState }) => (
                  <NumberInput
                    value={f.value ?? undefined}
                    onChange={(val) => f.onChange(val || null)}
                    label="Tahmini Teslimat Süresi"
                    placeholder="Gün"
                    min={1}
                    max={60}
                    suffix=" gün"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </Grid.Col>

            {countryType === "STATE" && (
              <Grid.Col span={12}>
                <Controller
                  control={control}
                  name={`serviceZones.${index}.stateIds`}
                  render={({ field: f, fieldState }) => (
                    <MultiSelect
                      value={f.value}
                      onChange={f.onChange}
                      data={statesData}
                      label="Eyaletler"
                      placeholder={
                        statesLoading
                          ? "Yükleniyor..."
                          : "Boş bırakırsanız tüm eyaletlere hizmet verir"
                      }
                      description="Belirli eyaletler seçin veya tümüne hizmet vermek için boş bırakın"
                      searchable
                      clearable
                      disabled={statesLoading}
                      maxDropdownHeight={200}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Grid.Col>
            )}

            {countryType === "CITY" && (
              <Grid.Col span={12}>
                <Controller
                  control={control}
                  name={`serviceZones.${index}.cityIds`}
                  render={({ field: f, fieldState }) => (
                    <MultiSelect
                      value={f.value}
                      onChange={f.onChange}
                      data={citiesData}
                      label="Şehirler"
                      placeholder={
                        citiesLoading
                          ? "Yükleniyor..."
                          : "Boş bırakırsanız tüm şehirlere hizmet verir"
                      }
                      description="Belirli şehirler seçin veya tümüne hizmet vermek için boş bırakın"
                      searchable
                      clearable
                      disabled={citiesLoading}
                      maxDropdownHeight={200}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Grid.Col>
            )}

            {countryType === "NONE" && (
              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">
                  Bu ülke için alt bölge seçimi gerekmiyor. Tüm ülkeye hizmet
                  verilecek.
                </Text>
              </Grid.Col>
            )}
          </Grid>
        </Collapse>
      </Card>
    );
  }
);

SortableZoneItem.displayName = "SortableZoneItem";

interface InventoryServiceInputProps {
  control: Control<InventoryLocationZodSchemaType>;
  setValue: UseFormReturn<InventoryLocationZodSchemaType>["setValue"];
  getValues: UseFormReturn<InventoryLocationZodSchemaType>["getValues"];
}

const InventoryServiceInput = ({
  control,
  getValues,
  setValue,
}: InventoryServiceInputProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "serviceZones",
    keyName: "fieldId",
  });

  const { data: countries } = useCountries();

  const countriesData = useMemo<CountryData[]>(
    () =>
      countries?.map((c) => ({
        id: c.id,
        name: c.translations?.[0]?.name,
        emoji: c.emoji || "",
      })) || [],
    [countries]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = fields.findIndex((f) => f.fieldId === active.id);
        const newIndex = fields.findIndex((f) => f.fieldId === over.id);

        move(oldIndex, newIndex);

        requestAnimationFrame(() => {
          const currentZones = getValues("serviceZones");
          currentZones.forEach((_, idx) => {
            setValue(`serviceZones.${idx}.priority`, idx);
          });
        });
      }
    },
    [fields, move, getValues, setValue]
  );

  const handleAddZone = useCallback(() => {
    append({
      id: undefined,
      countryId: "",
      countryType: "CITY" as CountryType,
      stateIds: [],
      cityIds: [],
      priority: fields.length,
      estimatedDeliveryDays: null,
    });
  }, [append, fields.length]);

  return (
    <FormCard
      title={
        <Group p={"md"} justify="space-between">
          <Group gap="xs">
            <IconWorld size={20} />
            <div>
              <Text fw={600}>Servis Bölgeleri</Text>
              <Text size="xs" c="dimmed">
                Bu lokasyonun hizmet vereceği bölgeleri tanımlayın. Sıralama
                önceliği belirler.
              </Text>
            </div>
          </Group>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={handleAddZone}
          >
            Bölge Ekle
          </Button>
        </Group>
      }
    >
      <Activity mode={fields.length === 0 ? "visible" : "hidden"}>
        <Card withBorder bg="gray.0" p="xl" radius="md">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" size="xl" color="gray">
              <IconWorld size={24} />
            </ThemeIcon>
            <Text c="dimmed" size="sm" ta="center">
              Henüz servis bölgesi tanımlanmadı.
              <br />
              Lokasyonun hizmet vereceği bölgeleri ekleyin.
            </Text>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={handleAddZone}
            >
              İlk Bölgeyi Ekle
            </Button>
          </Stack>
        </Card>
      </Activity>
      <Activity mode={fields.length > 0 ? "visible" : "hidden"}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.fieldId)}
            strategy={verticalListSortingStrategy}
          >
            <Stack gap="sm">
              {fields.map((field, index) => (
                <SortableZoneItem
                  key={field.fieldId}
                  field={field}
                  index={index}
                  control={control}
                  setValue={setValue}
                  remove={remove}
                  countriesData={countriesData}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      </Activity>
    </FormCard>
  );
};

export default InventoryServiceInput;
