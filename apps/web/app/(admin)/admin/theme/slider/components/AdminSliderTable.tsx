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
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ActionIcon,
  Button,
  Center,
  Group,
  Modal,
  Paper,
  Stack,
  Switch,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  Controller,
  DateFormatter,
  SubmitHandler,
  useFieldArray,
  useForm,
  useQuery,
  zodResolver,
} from "@repo/shared";
import { Slider, SliderSchema } from "@repo/types";
import {
  IconEdit,
  IconGripVertical,
  IconPlus,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GlobalLoadingOverlay from "../../../../../components/GlobalLoadingOverlay";
import TableAsset from "../../../../components/TableAsset";
import ProductPriceNumberInput from "../../../product-list/create-variant/components/ProductPriceNumberInput";

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
}

const SortableRow = ({ id, children }: SortableRowProps) => {
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
    <Table.Tr ref={setNodeRef} style={style} {...attributes}>
      <Table.Td>
        <ActionIcon
          variant="transparent"
          size="lg"
          {...listeners}
          style={{ cursor: "grab" }}
        >
          <IconGripVertical />
        </ActionIcon>
      </Table.Td>
      {children}
    </Table.Tr>
  );
};

const AdminSliderTable = () => {
  const { push } = useRouter();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [opened, { open, close }] = useDisclosure();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-slider-items"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/theme/get-slider-items`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );
      if (!res.ok) {
        notifications.show({
          title: "Hata",
          message: "Slider öğeleri alınırken bir hata oluştu.",
          color: "red",
        });
        throw new Error("Failed to fetch slider items");
      }
      const data = (await res.json()) as Slider;
      return data;
    },
    refetchOnWindowFocus: false,
    gcTime: 0,
    staleTime: 0,
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting: formSubmitting, errors },
  } = useForm<Slider>({
    resolver: zodResolver(SliderSchema),
    defaultValues: data
      ? {
          sliders: data.sliders.map((s) => ({
            endDate: s.endDate ? new Date(s.endDate) : null,
            startDate: s.startDate ? new Date(s.startDate) : null,
            ...s,
          })),
          ...data,
        }
      : { isAutoPlay: false, sliders: [], autoPlayInterval: null },
  });
  const isAutoPlay = watch("isAutoPlay");
  const { fields, move } = useFieldArray({
    control,
    name: "sliders",
  });

  const watchedSliders = watch("sliders");

  useEffect(() => {
    if (data) {
      const processedData = {
        ...data,
        sliders: data.sliders.map((slider) => ({
          ...slider,
          startDate: slider.startDate ? new Date(slider.startDate) : null,
          endDate: slider.endDate ? new Date(slider.endDate) : null,
        })),
      };
      reset(processedData);
      setHasChanges(false);
    }
  }, [data, reset]);
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

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      move(oldIndex, newIndex);
      setHasChanges(true);
    }
  };

  const handleApplyOrder = async () => {
    if (!watchedSliders || watchedSliders.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderUpdates = watchedSliders.map((slider, index) => ({
        uniqueId: slider.uniqueId,
        order: index,
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/theme/update-sliders-order`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(orderUpdates),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sıralama güncellenemedi");
      }

      const result = await response.json();

      notifications.show({
        title: "Başarılı",
        message: result.message, // Backend'den gelen mesaj
        color: "green",
      });

      setHasChanges(false);
      refetch(); // Verileri yeniden getir
    } catch (error) {
      notifications.show({
        title: "Hata",
        message: error.message || "Sıralama güncellenirken hata oluştu",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetOrder = () => {
    if (data) {
      reset(data);
      setHasChanges(false);
    }
  };

  const onSubmit: SubmitHandler<Slider> = async (data) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/theme/update-slider-settings`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) {
      const errMessage = (await res.json()).message;
      console.error("Error updating slider settings:", errMessage);
      notifications.show({
        title: "Hata",
        message: errMessage || "Ayarlar güncellenirken bir hata oluştu.",
        color: "red",
      });
      return;
    }
    notifications.show({
      title: "Başarılı",
      message: "Ayarlar başarıyla güncellendi.",
      color: "green",
    });
    refetch();
    close();
  };
  if (!isLoading && (!data?.sliders || data.sliders.length === 0)) {
    return (
      <>
        {(isLoading || isFetching) && <GlobalLoadingOverlay />}
        <Stack gap="xl">
          <Group justify="space-between">
            <Title order={4}>Slider Ayarları ve Öğeleri</Title>
          </Group>
          <Center>
            <Paper p="xl" withBorder>
              <Stack gap="md" align="center">
                <Text size="lg" c="dimmed">
                  Henüz bir slider eklemediniz
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => push("/admin/theme/slider/new")}
                >
                  İlk Slider&apos;ı Ekle
                </Button>
              </Stack>
            </Paper>
          </Center>
        </Stack>
      </>
    );
  }

  return (
    <>
      {(isLoading || isFetching || isSubmitting) && <GlobalLoadingOverlay />}
      <Stack gap="xl">
        <Group gap="md" align="center" justify="space-between">
          <Group gap="md">
            <Title order={4}>Slider Ayarları ve Öğeleri</Title>
            {hasChanges && (
              <Text size="sm" c="orange">
                Değişiklikler kaydedilmedi
              </Text>
            )}
          </Group>
          <Group>
            {hasChanges && (
              <>
                <Button
                  variant="outline"
                  onClick={handleResetOrder}
                  disabled={isSubmitting}
                >
                  Sıfırla
                </Button>
                <Button
                  onClick={handleApplyOrder}
                  loading={isSubmitting}
                  color="green"
                >
                  Sıralamayı Uygula
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => push("/admin/theme/slider/new")}
            >
              Slider Ekle
            </Button>
            <ActionIcon variant="transparent" onClick={open}>
              <IconSettings />
            </ActionIcon>
          </Group>
        </Group>

        <Table.ScrollContainer minWidth={800}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <Table
              highlightOnHover
              highlightOnHoverColor="admin.0"
              verticalSpacing="md"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Sıra</Table.Th>
                  <Table.Th>Resim</Table.Th>
                  <Table.Th>Tarih</Table.Th>
                  <Table.Th>Link Türü</Table.Th>
                  <Table.Th>İşlemler</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <SortableContext
                  items={fields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((field, index) => (
                    <SortableRow key={field.id} id={field.id}>
                      <Table.Td>
                        <TableAsset
                          type={field.existingDesktopAsset?.type || "IMAGE"}
                          url={field.existingDesktopAsset?.url || ""}
                        />
                      </Table.Td>
                      <Table.Td>
                        {!field.startDate && !field.endDate && "Süresiz"}
                        {field.startDate && !field.endDate && (
                          <>{DateFormatter.withTime(field.startDate)} - ...</>
                        )}
                        {!field.startDate && field.endDate && (
                          <>... - {DateFormatter.withTime(field.endDate)}</>
                        )}
                        {field.startDate && field.endDate && (
                          <>
                            {DateFormatter.withTime(field.startDate)} -{" "}
                            {DateFormatter.withTime(field.endDate)}
                          </>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {field.customLink && "Özel Link"}
                        {field.productLink && "Ürün Linki"}
                        {field.categoryLink && "Kategori Linki"}
                        {field.brandLink && "Marka Linki"}
                        {!field.customLink &&
                          !field.productLink &&
                          !field.categoryLink &&
                          !field.brandLink &&
                          "Link Yok"}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="transparent"
                            onClick={() =>
                              push(`/admin/theme/slider/${field.uniqueId}`)
                            }
                          >
                            <IconEdit />
                          </ActionIcon>
                          <ActionIcon variant="transparent" color="red">
                            <IconTrash />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </SortableRow>
                  ))}
                </SortableContext>
              </Table.Tbody>
            </Table>
          </DndContext>
        </Table.ScrollContainer>
      </Stack>
      <Modal opened={opened} onClose={close} title="Slider Ayarları">
        <Stack gap={"lg"}>
          <Controller
            control={control}
            name="isAutoPlay"
            render={({ field: { value, ...field }, fieldState }) => (
              <Switch
                {...field}
                checked={value}
                error={fieldState.error?.message}
                label="Otomatik Oynat"
              />
            )}
          />
          {isAutoPlay && (
            <Controller
              control={control}
              name="autoPlayInterval"
              render={({ field, fieldState }) => (
                <ProductPriceNumberInput
                  {...field}
                  error={fieldState.error?.message}
                  label="Otomatik Oynatma Aralığı (ms)"
                />
              )}
            />
          )}

          <Group justify="flex-end">
            <Button variant="outline" onClick={handleSubmit(onSubmit)}>
              Değişiklikleri Kaydet
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default AdminSliderTable;
