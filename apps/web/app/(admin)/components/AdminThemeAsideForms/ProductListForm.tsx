"use client";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import fetchWrapper from "@lib/fetchWrapper";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  ColorInput,
  Group,
  InputError,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";
import {
  Controller,
  createId,
  SubmitHandler,
  useFieldArray,
  useForm,
  useQuery,
  zodResolver,
} from "@repo/shared";
import {
  MantineSize,
  ModalProductCardForAdmin,
  ProductListComponentSchema,
  ProductListComponentType,
} from "@repo/types";
import { IconX } from "@tabler/icons-react";
import { useState, useMemo } from "react";

interface ProductListFormProps {
  defaultValues?: ProductListComponentType;
  onSubmit: SubmitHandler<ProductListComponentType>;
}

const ProductListForm = ({ defaultValues, onSubmit }: ProductListFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  const debouncedSearch = useDebouncedCallback((searchQuery: string) => {
    setDebouncedQuery(searchQuery);
  }, 500);

  // Seçili ürünleri getir
  const { data: selectedProducts } = useQuery({
    queryKey: ["selected-products", defaultValues?.items],
    queryFn: async () => {
      if (!defaultValues?.items?.length) return [];

      const res = await fetchWrapper.post<ModalProductCardForAdmin[]>(
        `/admin/products/get-selected-products`,
        {
          body: JSON.stringify({
            selectedItems: defaultValues.items,
          }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.success) throw new Error("Failed to fetch");
      return res.data;
    },

    enabled: !!defaultValues?.items?.length,
  });

  // Arama sonuçlarını getir
  const {
    data: searchResults,
    isFetching,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: ["search-products-for-modals", debouncedQuery],
    queryFn: async () => {
      const res = await fetchWrapper.get<ModalProductCardForAdmin[]>(
        `/admin/products/get-product-and-variants-for-modal?search=${debouncedQuery}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.success) throw new Error("Failed to fetch");
      return res.data;
    },

    refetchOnWindowFocus: false,
    enabled: debouncedQuery.length >= 3,
  });

  // İki veriyi birleştir
  const data = useMemo(() => {
    const selected = selectedProducts || [];
    const searched = searchResults || [];

    // Eğer arama yapılmamışsa sadece seçili ürünleri göster
    if (debouncedQuery.length < 3) {
      return selected;
    }

    // Duplicateları kaldırarak birleştir
    const combined = [...selected];
    searched.forEach((item) => {
      const exists = combined.some(
        (s) =>
          s.productId === item.productId &&
          (s.variantId || "main") === (item.variantId || "main")
      );
      if (!exists) combined.push(item);
    });

    return combined;
  }, [selectedProducts, searchResults, debouncedQuery]);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<ProductListComponentType>({
    resolver: zodResolver(ProductListComponentSchema),
    defaultValues: defaultValues || {
      uniqueId: createId(),
      backgroundColor: "#ffffff",
      titleColor: "#000000",
      textColor: "#000000",
      titleFontSize: MantineSize.md,
      title: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const isProductSelected = (product: ModalProductCardForAdmin) => {
    return fields.some(
      (item) =>
        item.productId === product.productId &&
        (item.variantId || "main") === (product.variantId || "main")
    );
  };

  const handleProductSelect = (product: ModalProductCardForAdmin) => {
    const selectedIndex = fields.findIndex(
      (item) =>
        item.productId === product.productId &&
        (item.variantId || "main") === (product.variantId || "main")
    );

    if (selectedIndex !== -1) {
      remove(selectedIndex);
    } else {
      append({
        productId: product.productId,
        variantId: product.variantId || "main",
      });
    }
  };

  const formatPrice = (price: number, discountedPrice: number | null) => {
    if (discountedPrice && discountedPrice < price) {
      return (
        <Group gap="xs">
          <ProductPriceFormatter
            price={price}
            size="sm"
            td="line-through"
            c="dimmed"
          />
          <ProductPriceFormatter
            price={discountedPrice}
            size="sm"
            fw={600}
            c="red"
          />
        </Group>
      );
    }

    return <ProductPriceFormatter price={price} size="sm" fw={600} />;
  };

  const handleClearAll = () => {
    remove(); // Tüm seçimleri kaldır
  };

  const handleClearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  // Loading durumu - hem arama hem de seçili ürünler yükleniyorsa
  const isDataLoading =
    (isLoading || isFetching || isPending) && debouncedQuery.length >= 3;
  return (
    <>
      <Stack gap={"lg"}>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              error={fieldState.error?.message}
              label="Başlık"
            />
          )}
        />
        <Controller
          control={control}
          name="backgroundColor"
          render={({ field: { onChange, ...field } }) => (
            <ColorInput
              onChangeEnd={onChange}
              {...field}
              label="Arka Plan Rengi"
            />
          )}
        />
        <Controller
          control={control}
          name="titleColor"
          render={({ field: { onChange, ...field } }) => (
            <ColorInput
              onChangeEnd={onChange}
              {...field}
              label="Başlık Rengi"
            />
          )}
        />
        <Controller
          control={control}
          name="textColor"
          render={({ field: { onChange, ...field } }) => (
            <ColorInput onChangeEnd={onChange} {...field} label="Yazı Rengi" />
          )}
        />
        <Stack gap={"xs"}>
          {errors && errors.items && (
            <InputError>{errors.items.message}</InputError>
          )}
          <Group className="w-full" justify="flex-end">
            <Button variant="light" onClick={open}>
              Ürün Seç ({fields.length} seçili)
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>Kaydet</Button>
          </Group>
        </Stack>
      </Stack>

      <Modal
        opened={opened}
        size={"xl"}
        onClose={close}
        centered
        title="Ürün Seç"
        classNames={{
          header: "border-b-2 border-b-gray-300",
        }}
      >
        <Stack gap={"md"} py={"md"}>
          <Group gap={"lg"} align="end">
            <TextInput
              label="Ürün Ara"
              rightSection={
                query.trim().length > 0 && (
                  <ActionIcon
                    size={"xs"}
                    variant="transparent"
                    onClick={handleClearSearch}
                  >
                    <IconX />
                  </ActionIcon>
                )
              }
              placeholder="Ürün adını aratabilirsiniz"
              value={query}
              onChange={(e) => {
                const newValue = e.currentTarget.value;
                setQuery(newValue);
                debouncedSearch(newValue);
              }}
            />
            {fields.length > 0 && (
              <Button variant="filled" color={"red"} onClick={handleClearAll}>
                Seçilenleri Kaldır ({fields.length})
              </Button>
            )}
          </Group>

          <Box style={{ position: "relative", minHeight: "200px" }}>
            {isDataLoading ? (
              <Center h={200}>
                <Loader size="md" />
              </Center>
            ) : data && data.length > 0 ? (
              <ScrollArea>
                <Stack gap={"xs"} py={"md"}>
                  {data.map((product) => {
                    const isSelected = isProductSelected(product);
                    return (
                      <Paper
                        key={`${product.productId}-${product.variantId || "main"}`}
                        p="md"
                        withBorder
                        className={`cursor-pointer transition-colors  ${
                          isSelected
                            ? "ring-2 ring-[var(--mantine-primary-color-5)] bg-[var(--mantine-primary-color-0)]"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <Group justify="space-between" align="flex-start">
                          <Group gap="md" align="flex-start">
                            <Checkbox
                              variant="outline"
                              readOnly
                              checked={isSelected}
                            />

                            {product.image &&
                              product.image.type === "IMAGE" && (
                                <div className="size-20 relative rounded-md overflow-hidden flex-shrink-0">
                                  <CustomImage src={product.image.url} />
                                </div>
                              )}

                            <Stack gap="xs" style={{ flex: 1 }}>
                              <Text fw={500} lineClamp={2}>
                                {product.productName}
                              </Text>

                              {product.brandName && (
                                <Text size="sm" c="dimmed">
                                  {product.brandName}
                                </Text>
                              )}

                              {/* Varyant bilgileri */}
                              {product.variants &&
                                product.variants.length > 0 && (
                                  <Group gap="xs">
                                    {product.variants
                                      .slice(0, 3)
                                      .map((variant) => (
                                        <Badge
                                          key={variant.productVariantOptionId}
                                          size="md"
                                          variant="dot"
                                          color="gray"
                                        >
                                          {variant.productVariantOptionName}
                                        </Badge>
                                      ))}
                                    {product.variants.length > 3 && (
                                      <Badge
                                        size="md"
                                        variant="light"
                                        color="gray"
                                      >
                                        +{product.variants.length - 3} daha
                                      </Badge>
                                    )}
                                  </Group>
                                )}
                            </Stack>
                          </Group>

                          <Stack gap="xs" align="flex-end">
                            {formatPrice(
                              product.price,
                              product.discountedPrice
                            )}
                          </Stack>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </ScrollArea>
            ) : debouncedQuery.length >= 3 ? (
              <Center h={200}>
                <Text c="dimmed">Ürün bulunamadı</Text>
              </Center>
            ) : selectedProducts && selectedProducts.length > 0 ? (
              <Center h={200}>
                <Text c="dimmed">
                  {selectedProducts.length} ürün seçili. Arama yapmak için en az
                  3 karakter girin.
                </Text>
              </Center>
            ) : (
              <Center h={200}>
                <Text c="dimmed">Arama yapmak için en az 3 karakter girin</Text>
              </Center>
            )}
          </Box>
        </Stack>
      </Modal>
    </>
  );
};

export default ProductListForm;
