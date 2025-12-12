import GlobalLoader from "@/components/GlobalLoader";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  Button,
  Card,
  Group,
  Image,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
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
  BrandIdAndName,
  CategoryIdAndName,
  FooterLinkSchema,
  FooterLinkType,
} from "@repo/types";
import { useState } from "react";
import { AssetType } from "@repo/database/client";
type AddType = "brand" | "category" | "product" | "custom";

interface FooterLinkFormProps {
  defaultValues?: FooterLinkType;
  onSubmit: SubmitHandler<FooterLinkType>;
  existingLinks?: FooterLinkType[]; // Mevcut linkleri kontrol etmek için
}

const FooterLinkForm = ({
  onSubmit,
  defaultValues,
  existingLinks = [],
}: FooterLinkFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [addType, setAddType] = useState<AddType>(
    defaultValues?.customLink
      ? "custom"
      : defaultValues?.productId
        ? "product"
        : defaultValues?.categoryId
          ? "category"
          : defaultValues?.brandId
            ? "brand"
            : "custom"
  );

  // Zaten kullanılmış ID'leri kontrol etmek için helper fonksiyonlar
  const isItemAlreadySelected = (id: string, type: AddType) => {
    // Mevcut düzenlenen linki hariç tut
    const otherLinks = existingLinks.filter(
      (link) => link.uniqueId !== defaultValues?.uniqueId
    );

    switch (type) {
      case "brand":
        return otherLinks.some((link) => link.brandId === id);
      case "category":
        return otherLinks.some((link) => link.categoryId === id);
      case "product":
        return otherLinks.some((link) => link.productId === id);
      default:
        return false;
    }
  };

  const isCustomLinkAlreadyUsed = (customLink: string) => {
    const otherLinks = existingLinks.filter(
      (link) => link.uniqueId !== defaultValues?.uniqueId
    );
    return otherLinks.some((link) => link.customLink === customLink);
  };

  const { data: brands, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["get-brands"],
    queryFn: async () => {
      const response = await fetchWrapper.get<
        Array<
          BrandIdAndName & {
            image: { url: string; type: AssetType } | null;
          }
        >
      >(`/admin/products/brands/get-all-brands-only-id-name-image`, {});
      if (!response.success) {
        console.error("Marka verisi alınamadı");
        return [];
      }
      return response.data;
    },
    enabled: addType === "brand" && opened,
    staleTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["get-categories"],
    queryFn: async () => {
      const res = await fetchWrapper.get<
        Array<
          CategoryIdAndName & {
            image: { url: string; type: AssetType } | null;
          }
        >
      >(`/admin/products/categories/get-all-categories-only-id-name-image`, {});
      if (!res.success) {
        console.error("Kategori verisi alınamadı");
        return [];
      }
      return res.data;
    },
    enabled: addType === "category" && opened,
    staleTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["get-products"],
    queryFn: async () => {
      const res = await fetchWrapper.get<
        Array<{
          id: string;
          name: string;
          image: { url: string; type: AssetType } | null;
        }>
      >(`/admin/products/get-all-products-id-name-image`, {});
      if (!res.success) {
        return [];
      }
      return res.data;
    },
    enabled: addType === "product" && opened,
    staleTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FooterLinkType>({
    resolver: zodResolver(FooterLinkSchema),
    defaultValues: defaultValues || {
      title: "",
      brandId: null,
      categoryId: null,
      productId: null,
      customLink: "",
      uniqueId: createId(),
    },
  });

  const watchedValues = watch();

  const handleSelectItem = (id: string, type: AddType) => {
    setValue("brandId", null);
    setValue("categoryId", null);
    setValue("productId", null);
    switch (type) {
      case "brand":
        setValue("brandId", id);
        setValue("title", brands?.find((b) => b.id === id)?.name || "");
        break;
      case "category":
        setValue("categoryId", id);
        setValue("title", categories?.find((c) => c.id === id)?.name || "");
        break;
      case "product":
        setValue("productId", id);
        setValue("title", products?.find((p) => p.id === id)?.name || "");
        break;
    }

    close();
  };

  const renderModalContent = () => {
    if (addType === "brand") {
      if (isLoadingBrands) return <GlobalLoader />;

      return (
        <ScrollArea h={300}>
          <Stack gap="xs">
            {brands?.map((brand) => {
              const isDisabled = isItemAlreadySelected(brand.id, "brand");
              return (
                <Card
                  key={brand.id}
                  shadow="xs"
                  padding="xs"
                  radius="md"
                  withBorder
                  style={{
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  onClick={() =>
                    !isDisabled && handleSelectItem(brand.id, "brand")
                  }
                  bg={watchedValues.brandId === brand.id ? "blue.0" : undefined}
                >
                  <Group gap="xs" justify="space-between">
                    <Group gap="xs">
                      {brand.image && (
                        <Image
                          src={brand.image.url}
                          alt={brand.name}
                          width={40}
                          height={40}
                          radius="sm"
                        />
                      )}
                      <Text size="sm" c={isDisabled ? "dimmed" : undefined}>
                        {brand.name}
                      </Text>
                    </Group>
                    {isDisabled && (
                      <Text size="xs" c="red">
                        Kullanımda
                      </Text>
                    )}
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </ScrollArea>
      );
    }

    if (addType === "category") {
      if (isLoadingCategories) return <GlobalLoader />;

      return (
        <ScrollArea h={300}>
          <Stack gap="xs">
            {categories?.map((category) => {
              const isDisabled = isItemAlreadySelected(category.id, "category");
              return (
                <Card
                  key={category.id}
                  shadow="xs"
                  padding="xs"
                  radius="md"
                  withBorder
                  style={{
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  onClick={() =>
                    !isDisabled && handleSelectItem(category.id, "category")
                  }
                  bg={
                    watchedValues.categoryId === category.id
                      ? "blue.0"
                      : undefined
                  }
                >
                  <Group gap="xs" justify="space-between">
                    <Group gap="xs">
                      {category.image && (
                        <Image
                          src={category.image.url}
                          alt={category.name}
                          width={40}
                          height={40}
                          radius="sm"
                        />
                      )}
                      <Text size="sm" c={isDisabled ? "dimmed" : undefined}>
                        {category.name}
                      </Text>
                    </Group>
                    {isDisabled && (
                      <Text size="xs" c="red">
                        Kullanımda
                      </Text>
                    )}
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </ScrollArea>
      );
    }

    if (addType === "product") {
      if (isLoadingProducts) return <GlobalLoader />;

      return (
        <ScrollArea h={300}>
          <Stack gap="xs">
            {products?.map((product) => {
              const isDisabled = isItemAlreadySelected(product.id, "product");
              return (
                <Card
                  key={product.id}
                  shadow="xs"
                  padding="xs"
                  radius="md"
                  withBorder
                  style={{
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  onClick={() =>
                    !isDisabled && handleSelectItem(product.id, "product")
                  }
                  bg={
                    watchedValues.productId === product.id
                      ? "blue.0"
                      : undefined
                  }
                >
                  <Group gap="xs" justify="space-between">
                    <Group gap="xs">
                      {product.image && (
                        <Image
                          src={product.image.url}
                          alt={product.name}
                          width={40}
                          height={40}
                          radius="sm"
                        />
                      )}
                      <Text size="sm" c={isDisabled ? "dimmed" : undefined}>
                        {product.name}
                      </Text>
                    </Group>
                    {isDisabled && (
                      <Text size="xs" c="red">
                        Kullanımda
                      </Text>
                    )}
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </ScrollArea>
      );
    }

    return null;
  };

  const getSelectedItemName = () => {
    if (watchedValues.brandId && brands) {
      const brand = brands.find((b) => b.id === watchedValues.brandId);
      return brand?.name;
    }
    if (watchedValues.categoryId && categories) {
      const category = categories.find(
        (c) => c.id === watchedValues.categoryId
      );
      return category?.name;
    }
    if (watchedValues.productId && products) {
      const product = products.find((p) => p.id === watchedValues.productId);
      return product?.name;
    }
    return null;
  };

  const modalTitle =
    addType === "brand"
      ? "Marka Seç"
      : addType === "category"
        ? "Kategori Seç"
        : "Ürün Seç";

  return (
    <>
      <Stack gap="sm">
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              error={fieldState.error?.message}
              label="Başlık"
              size="sm"
            />
          )}
        />

        <Select
          data={[
            { label: "Özel Link", value: "custom" },
            { label: "Ürün", value: "product" },
            { label: "Kategori", value: "category" },
            { label: "Marka", value: "brand" },
          ]}
          allowDeselect={false}
          value={addType}
          onChange={(value) => {
            setAddType(value as AddType);
            setValue("brandId", null);
            setValue("categoryId", null);
            setValue("productId", null);
            setValue("customLink", "");
          }}
          size="sm"
          label="Link Tipi"
        />

        {addType !== "custom" ? (
          <Stack gap="xs">
            <Button variant="light" onClick={open} size="sm">
              {modalTitle}
            </Button>
            {getSelectedItemName() && (
              <Text size="xs" c="dimmed">
                Seçilen: {getSelectedItemName()}
              </Text>
            )}
          </Stack>
        ) : (
          <Controller
            control={control}
            name="customLink"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                error={fieldState.error?.message}
                label="Link URL"
                size="sm"
                placeholder="https://"
                onBlur={(e) => {
                  field.onBlur();
                  // Özel link kontrolü
                  const value = e.target.value.trim();
                  if (value && isCustomLinkAlreadyUsed(value)) {
                    // Form error set etmek için setValue ile custom validation
                    setValue("customLink", "", { shouldValidate: true });
                  }
                }}
              />
            )}
          />
        )}

        <Group justify="end" gap="xs">
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
            size="sm"
          >
            Kaydet
          </Button>
        </Group>
      </Stack>

      <Modal opened={opened} onClose={close} title={modalTitle} size="sm">
        {renderModalContent()}
      </Modal>
    </>
  );
};

export default FooterLinkForm;
