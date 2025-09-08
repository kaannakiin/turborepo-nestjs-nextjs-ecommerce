"use client";

import {
  Button,
  Group,
  InputDescription,
  InputError,
  InputLabel,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  Controller,
  createId,
  SubmitHandler,
  useForm,
  useQuery,
  zodResolver,
} from "@repo/shared";
import { SliderItem, SliderItemSchema } from "@repo/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GlobalDropzone from "../../../../../components/GlobalDropzone";
import GlobalLoadingOverlay from "../../../../../components/GlobalLoadingOverlay";

interface SliderItemFormProps {
  defaultValues?: SliderItem;
}

const SliderItemForm = ({ defaultValues }: SliderItemFormProps) => {
  const { push } = useRouter();
  const [customLinkType, setCustomLinkType] = useState<
    "custom" | "product" | "category" | "brand" | null
  >(
    defaultValues
      ? defaultValues.customLink
        ? "custom"
        : defaultValues.productLink
          ? "product"
          : defaultValues.categoryLink
            ? "category"
            : defaultValues.brandLink
              ? "brand"
              : null
      : null
  );

  const getMinEndDate = (startDate: Date | string | null) => {
    if (!startDate) return new Date();
    const date = new Date(startDate);
    return new Date(date.getTime() + 60000); // 1 dakika sonra
  };

  const {
    data: productsData,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: ["get-products-for-selection"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/get-products-for-selection`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-cache",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = (await response.json()) as {
        products: { id: string; name: string }[];
      };
      return data.products;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const {
    data: categoryData,
    isFetching: isCategoryFetching,
    isLoading: isCategoryLoading,
  } = useQuery({
    queryKey: ["get-categories-for-selection"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/categories/get-all-categories-only-id-and-name`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-cache",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = (await response.json()) as { id: string; name: string }[];
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const {
    data: brandsData,
    isFetching: isBrandsFetching,
    isLoading: isBrandsLoading,
  } = useQuery({
    queryKey: ["get-brands-for-selection"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/brands/get-all-brands-only-id-and-name`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-cache",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = (await response.json()) as { id: string; name: string }[];
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<SliderItem>({
    resolver: zodResolver(SliderItemSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          startDate: defaultValues?.startDate
            ? new Date(defaultValues.startDate)
            : null,
          endDate: defaultValues?.endDate
            ? new Date(defaultValues.endDate)
            : null,
        }
      : {
          desktopAsset: null,
          mobileAsset: null,
          existingDesktopAsset: null,
          existingMobileAsset: null,
          brandLink: null,
          categoryLink: null,
          productLink: null,
          customLink: null,
          startDate: null,
          endDate: null,
          isActive: true,
          uniqueId: createId(),
        },
  });

  const existingDesktopAsset = watch("existingDesktopAsset") || null;
  const existingMobileAsset = watch("existingMobileAsset") || null;
  const startDate = watch("startDate") || null;
  const endDate = watch("endDate") || null;

  const onSubmit: SubmitHandler<SliderItem> = async (data) => {
    try {
      const { desktopAsset, mobileAsset, ...rest } = data;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/theme/create-or-update-slider-item`,
        {
          method: "POST",
          body: JSON.stringify(rest),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-cache",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        notifications.show({
          title: "Error",
          message: errorData.message || "Failed to save slider item",
          color: "red",
          autoClose: 3000,
        });
        return;
      }

      // 2. Desktop asset varsa yükle
      if (desktopAsset) {
        const desktopFormData = new FormData();
        desktopFormData.append("file", desktopAsset);
        desktopFormData.append("id", data.uniqueId);

        const desktopResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/theme/create-or-update-desktop-asset`,
          {
            method: "POST",
            body: desktopFormData,
            credentials: "include",
            cache: "no-cache",
          }
        );

        if (!desktopResponse.ok) {
          const errorData = await desktopResponse.json();
          notifications.show({
            title: "Error",
            message: errorData.message || "Failed to upload desktop media",
            color: "red",
            autoClose: 3000,
          });
          return;
        }
      }

      // 3. Mobile asset varsa yükle
      if (mobileAsset) {
        const mobileFormData = new FormData();
        mobileFormData.append("file", mobileAsset);
        mobileFormData.append("id", data.uniqueId);

        const mobileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/theme/create-or-update-mobile-asset`,
          {
            method: "POST",
            body: mobileFormData,
            credentials: "include",
            cache: "no-cache",
          }
        );

        if (!mobileResponse.ok) {
          const errorData = await mobileResponse.json();
          notifications.show({
            title: "Error",
            message: errorData.message || "Failed to upload mobile media",
            color: "red",
            autoClose: 3000,
          });
          return;
        }
      }

      // 4. Başarı mesajı
      notifications.show({
        title: "Başarılı",
        message: "Slider öğesi başarıyla kaydedildi",
        color: "green",
        autoClose: 3000,
      });
      push("/admin/theme/slider");
    } catch (error) {
      console.error("Submit error:", error);
      notifications.show({
        title: "Error",
        message: "Beklenmedik bir hata oluştu",
        color: "red",
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      {isSubmitting && <GlobalLoadingOverlay />}
      {errors && Object.keys(errors).length > 0 && (
        <div className="flex flex-col gap-1 my-2">
          {Object.values(errors).map((error, index) => (
            <InputError key={index}>
              {error?.message || "Bir hata oluştu"}
            </InputError>
          ))}
        </div>
      )}
      <Stack gap={"lg"}>
        <Group justify="space-between" align="center">
          <Title order={4}>
            {defaultValues ? "Slider Öğesini Düzenle" : "Yeni Slider Öğesi"}
          </Title>
          <Group gap={"md"}>
            <Button
              variant="outline"
              onClick={() => {
                setValue("isActive", false);
                handleSubmit(onSubmit)();
              }}
            >
              Taslak Olarak Kaydet
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>Kaydet</Button>
          </Group>
        </Group>
        <Controller
          control={control}
          name="desktopAsset"
          render={({ field, fieldState }) => (
            <Stack gap={"xs"}>
              <InputLabel>Desktop Medya</InputLabel>
              <InputDescription>
                16/9 oranında görseller veya videolar yüklemeniz tavsiye edilir.
              </InputDescription>
              <GlobalDropzone
                {...field}
                onDrop={(files) => field.onChange(files[0])}
                accept={["IMAGE", "VIDEO"]}
                cols={1}
                error={fieldState.error?.message}
                existingImages={
                  existingDesktopAsset
                    ? [
                        {
                          url: existingDesktopAsset.url,
                          type: existingDesktopAsset.type,
                        },
                      ]
                    : []
                }
              />
            </Stack>
          )}
        />
        <Controller
          control={control}
          name="mobileAsset"
          render={({ field, fieldState }) => (
            <Stack gap={"xs"}>
              <InputLabel>Mobil Medya</InputLabel>
              <InputDescription>
                4/3 oranında görseller veya videolar yüklemeniz tavsiye edilir.
                Yüklenmezse, masaüstü medyanız kullanılır.
              </InputDescription>
              <GlobalDropzone
                {...field}
                onDrop={(files) => field.onChange(files[0])}
                accept={["IMAGE", "VIDEO"]}
                cols={1}
                error={fieldState.error?.message}
                existingImages={
                  existingMobileAsset
                    ? [
                        {
                          url: existingMobileAsset.url,
                          type: existingMobileAsset.type,
                        },
                      ]
                    : []
                }
              />
            </Stack>
          )}
        />

        <Group gap={"lg"}>
          <Select
            data={[
              { label: "Özel Bağlantı", value: "custom" },
              { label: "Ürün Bağlantısı", value: "product" },
              { label: "Kategori Bağlantısı", value: "category" },
              { label: "Marka Bağlantısı", value: "brand" },
            ]}
            onChange={(value) => {
              setCustomLinkType(
                value as "custom" | "product" | "category" | "brand" | null
              );

              if (value === "custom") {
                setValue("productLink", null);
                setValue("categoryLink", null);
                setValue("brandLink", null);
              } else if (value === "product") {
                setValue("customLink", null);
                setValue("categoryLink", null);
                setValue("brandLink", null);
              } else if (value === "category") {
                setValue("customLink", null);
                setValue("productLink", null);
                setValue("brandLink", null);
              } else if (value === "brand") {
                setValue("customLink", null);
                setValue("productLink", null);
                setValue("categoryLink", null);
              }
            }}
            value={customLinkType}
            label="Bağlantı Türü"
            description="Bu slider öğesinin bağlantı türünü seçin. Eğer bağlantı seçmek istemiyorsanız boş bırakın."
          />
          {customLinkType === "custom" ? (
            <Controller
              control={control}
              name="customLink"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  error={fieldState.error?.message}
                  label="Özel Bağlantı"
                  description="Bu slider öğesine tıklandığında gidilecek özel bağlantı"
                />
              )}
            />
          ) : customLinkType === "product" ? (
            <Controller
              control={control}
              name="productLink"
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  error={fieldState.error?.message}
                  label="Ürün Seçimi"
                  searchable
                  clearable
                  nothingFoundMessage="Ürün bulunamadı"
                  description="Bu slider öğesine tıklandığında gidilecek ürün"
                  data={
                    isLoading || isFetching
                      ? []
                      : (productsData &&
                          productsData.length > 0 &&
                          productsData.map((product) => ({
                            value: product.id,
                            label: product.name,
                          }))) ||
                        []
                  }
                />
              )}
            />
          ) : customLinkType === "category" ? (
            <Controller
              control={control}
              name="categoryLink"
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  error={fieldState.error?.message}
                  label="Kategori Seçimi"
                  searchable
                  clearable
                  nothingFoundMessage="Kategori bulunamadı"
                  description="Bu slider öğesine tıklandığında gidilecek kategori"
                  data={
                    isCategoryLoading || isCategoryFetching
                      ? []
                      : (categoryData &&
                          categoryData.length > 0 &&
                          categoryData.map((category) => ({
                            value: category.id,
                            label: category.name,
                          }))) ||
                        []
                  }
                />
              )}
            />
          ) : (
            customLinkType === "brand" && (
              <Controller
                control={control}
                name="brandLink"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    error={fieldState.error?.message}
                    label="Marka Seçimi"
                    searchable
                    clearable
                    nothingFoundMessage="Marka bulunamadı"
                    description="Bu slider öğesine tıklandığında gidilecek marka"
                    data={
                      isBrandsLoading || isBrandsFetching
                        ? []
                        : (brandsData &&
                            brandsData.length > 0 &&
                            brandsData.map((brand) => ({
                              value: brand.id,
                              label: brand.name,
                            }))) ||
                          []
                    }
                  />
                )}
              />
            )
          )}
        </Group>

        <SimpleGrid cols={{ xs: 2 }}>
          <Controller
            control={control}
            name="startDate"
            render={({ field, fieldState }) => (
              <DateTimePicker
                {...field}
                error={fieldState.error?.message}
                label="Başlangıç Tarihi"
                minDate={new Date()}
                valueFormat="DD MMMM YYYY HH:mm"
                maxDate={endDate || undefined}
                onChange={(date) => {
                  if (!date) {
                    field.onChange(null);
                  } else {
                    field.onChange(new Date(date));
                  }
                  if (date && endDate && new Date(date) >= endDate) {
                    setValue("endDate", null);
                  }
                }}
                clearable
              />
            )}
          />
          <Controller
            control={control}
            name="endDate"
            render={({ field, fieldState }) => (
              <DateTimePicker
                {...field}
                error={fieldState.error?.message}
                label="Bitiş Tarihi"
                onChange={(date) => {
                  if (!date) {
                    field.onChange(null);
                  } else {
                    field.onChange(new Date(date));
                  }
                }}
                valueFormat="DD MMMM YYYY HH:mm"
                minDate={getMinEndDate(startDate)}
                clearable
              />
            )}
          />
        </SimpleGrid>
      </Stack>
    </>
  );
};

export default SliderItemForm;
