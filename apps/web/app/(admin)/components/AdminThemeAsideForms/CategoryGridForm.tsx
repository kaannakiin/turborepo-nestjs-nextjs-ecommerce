"use client";

import GlobalLoader from "@/components/GlobalLoader";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { getMantineFontWeightLabel, getTextAlignLabel } from "@lib/helpers";
import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  ColorInput,
  Group,
  InputError,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Controller,
  createId,
  SubmitHandler,
  useForm,
  useQuery,
  zodResolver,
} from "@repo/shared";
import {
  CategoryGridComponentSchema,
  CategoryGridComponentType,
  CategoryIdAndName,
  MantineFontWeight,
  TextAlign,
} from "@repo/types";
import { IconInfoCircle, IconTrash } from "@tabler/icons-react";

interface CategoryGridFormProps {
  defaultValues?: CategoryGridComponentType;
  onSubmit: SubmitHandler<CategoryGridComponentType>;
}

const CategoryGridForm = ({
  onSubmit,
  defaultValues,
}: CategoryGridFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CategoryGridComponentType>({
    resolver: zodResolver(CategoryGridComponentSchema),
    defaultValues: defaultValues || {
      uniqueId: createId(),
      backgroundColor: "#ffffff",
      textColor: "#000000",
      categoryIds: [],
      tabletGridColumns: 2,
      mobileGridColumns: 1,
      desktopGridColumns: 4,
      fontWeight: "medium",
      imageScaleOnHover: true,
      showCategoryNamesOnImages: true,
      textAlign: TextAlign.left,
      showImageOverlay: false,
    },
  });

  const { data, isLoading, isFetching, isPending } = useQuery({
    queryKey: ["get-all-categories-only-id-and-name"],
    queryFn: async () => {
      const res = await fetchWrapper.get<CategoryIdAndName[]>(
        `/admin/products/categories/get-all-categories-only-id-and-name`
      );
      if (!res.success) {
        return [];
      }

      return res.data;
    },
  });
  const categoryIds = watch("categoryIds") || [];

  return (
    <>
      <Stack gap={"lg"}>
        <Alert
          variant="light"
          color="red"
          title="Bilgi"
          icon={<IconInfoCircle />}
        >
          Eklediğiniz kategorilerin resmi mevcut değilse, kategori resmi
          gösterilmeyecektir. Kategori resimlerini ürün kategorileri sayfasından
          düzenleyebilirsiniz.
        </Alert>
        <Controller
          control={control}
          name="backgroundColor"
          render={({ field: { onChange, ...field }, fieldState }) => (
            <ColorInput
              onChangeEnd={onChange}
              {...field}
              label="Arka Plan Rengi"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="textColor"
          render={({ field: { onChange, ...field }, fieldState }) => (
            <ColorInput
              onChangeEnd={onChange}
              {...field}
              label="Yazı Rengi"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="imageScaleOnHover"
          render={({ field: { value, ...field } }) => (
            <Switch
              checked={value}
              {...field}
              label="Hover Efekti"
              description="Kategori resimlerine mouse ile gelindiğinde büyütme efekti uygula"
            />
          )}
        />
        <Controller
          control={control}
          name="showCategoryNamesOnImages"
          render={({ field: { value, ...field } }) => (
            <Switch
              checked={value}
              {...field}
              label="Kategori İsimlerini Göster"
              description="Kategori resimlerinin üzerinde kategori isimlerini göster"
            />
          )}
        />
        <Controller
          control={control}
          name="showImageOverlay"
          render={({ field: { value, ...field } }) => (
            <Switch
              checked={value}
              {...field}
              label="Resim Overlay'i"
              description="Kategori resimlerinin üzerinde koyu bir katman göster"
            />
          )}
        />
        <Controller
          control={control}
          name="textAlign"
          render={({ field, fieldState }) => (
            <Select
              {...field}
              data={Object.keys(TextAlign).map((data) => ({
                value: data,
                label: getTextAlignLabel(data),
              }))}
              allowDeselect={false}
              label="Yazı Hizalaması"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="fontWeight"
          render={({ field, fieldState }) => (
            <Select
              {...field}
              data={Object.keys(MantineFontWeight).map((data) => ({
                value: data,
                label: getMantineFontWeightLabel(data as MantineFontWeight),
              }))}
              allowDeselect={false}
              label="Yazı Ağırlığı"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="desktopGridColumns"
          render={({ field, fieldState }) => (
            <NumberInput
              {...field}
              error={fieldState.error?.message}
              label="Bilgisayar Sütun Sayısı"
              min={1}
              max={Number.MAX_SAFE_INTEGER}
              hideControls
            />
          )}
        />
        <Controller
          control={control}
          name="tabletGridColumns"
          render={({ field, fieldState }) => (
            <NumberInput
              {...field}
              error={fieldState.error?.message}
              label="Tablet Sütun Sayısı"
              min={1}
              max={Number.MAX_SAFE_INTEGER}
              hideControls
            />
          )}
        />
        <Controller
          control={control}
          name="mobileGridColumns"
          render={({ field, fieldState }) => (
            <NumberInput
              {...field}
              error={fieldState.error?.message}
              label="Mobil Sütun Sayısı"
              min={1}
              max={Number.MAX_SAFE_INTEGER}
              hideControls
            />
          )}
        />
        {errors.categoryIds && (
          <Text c={"red"} fz={"md"}>
            {errors.categoryIds.message}
          </Text>
        )}
        <Group justify="end" gap={"lg"}>
          <Button variant="outline" onClick={open}>
            Kategori Ekle
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>Kaydet</Button>
        </Group>

        {categoryIds && categoryIds.length > 0 && (
          <Stack gap={"xs"}>
            <Text fz={"md"}>Seçili Kategoriler ({categoryIds.length}):</Text>
            <Stack gap={"xs"}>
              {categoryIds.map((id) => {
                const category = data?.find((cat) => cat.id === id);
                if (!category) return null;
                return (
                  <Group
                    align="center"
                    justify="space-between"
                    key={id}
                    className="w-full"
                  >
                    <Text fz={"md"} fw={700}>
                      {category.name}
                    </Text>
                    <ActionIcon
                      variant="transparent"
                      color="red"
                      size="xs"
                      onClick={() => {
                        setValue(
                          "categoryIds",
                          categoryIds.filter((catId) => catId !== id)
                        );
                      }}
                    >
                      <IconTrash />
                    </ActionIcon>
                  </Group>
                );
              })}
            </Stack>
          </Stack>
        )}
      </Stack>
      <Modal
        opened={opened}
        onClose={() => {
          close();
        }}
        title="Kategori Seçimi"
        classNames={{
          header: "border-b-2 border-b-gray-300",
        }}
        size={"lg"}
      >
        <ScrollArea py={"md"}>
          {isLoading || isFetching || isPending ? (
            <GlobalLoader />
          ) : data && data.length > 0 ? (
            <Stack gap={"md"}>
              {data.map((category) => (
                <Group
                  align="center"
                  justify="start"
                  className="w-full cursor-pointer"
                  key={category.id}
                  py={"md"}
                  onClick={() => {
                    if (categoryIds.includes(category.id)) {
                      setValue(
                        "categoryIds",
                        categoryIds.filter((id) => id !== category.id)
                      );
                    } else {
                      setValue("categoryIds", [...categoryIds, category.id]);
                    }
                  }}
                >
                  <Checkbox
                    readOnly
                    size="md"
                    checked={categoryIds.includes(category.id)}
                  />
                  <Text fz={"md"} fw={700}>
                    {category.name}
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <div className="w-full py-8 h-full flex justify-center items-center">
              <Text fz={"xl"} fw={700}>
                Hiç kategori bulunamadı
              </Text>
            </div>
          )}
        </ScrollArea>
      </Modal>
    </>
  );
};

export default CategoryGridForm;
