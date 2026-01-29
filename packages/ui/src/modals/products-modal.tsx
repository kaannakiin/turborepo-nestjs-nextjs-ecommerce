import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  ModalProps,
  Pagination as MantinePagination,
  Radio,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  AdminProductTableProductData,
  Pagination,
  ProductModalItem,
} from "@repo/types";
import { useEffect, useState } from "react";
import { Loader } from "../common";

interface ProductsModalProps extends Omit<ModalProps, "onSubmit" | "children"> {
  data: {
    products: AdminProductTableProductData[];
    pagination?: Pagination;
  };
  onSubmit: (items: ProductModalItem[]) => void;
  onSearch: (query: string) => void;
  selectedItems: ProductModalItem[];
  onPageChange: (page: number) => void;
  isLoading: boolean;
  multiple?: boolean;
}

const ProductsModal = ({
  data,
  onSubmit,
  onSearch,
  isLoading,
  selectedItems,
  onPageChange,
  onClose,
  multiple = true,
  ...props
}: ProductsModalProps) => {
  const [selectedItemsMap, setSelectedItemsMap] = useState<
    Map<string, ProductModalItem>
  >(() => {
    const map = new Map<string, ProductModalItem>();
    selectedItems.forEach((item) => {
      if (item.itemId) {
        map.set(item.itemId, item);
      }
    });
    return map;
  });

  useEffect(() => {
    const newMap = new Map<string, ProductModalItem>();
    selectedItems.forEach((item) => {
      if (item.itemId) {
        newMap.set(item.itemId, item);
      }
    });
    setSelectedItemsMap(newMap);
  }, [selectedItems]);

  const [searchValue, setSearchValue] = useState("");

  const handleSearch = useDebouncedCallback((query: string) => {
    onSearch(query);
  }, 500);

  const toggleSelection = (
    variantId: string,
    product: AdminProductTableProductData,
  ) => {
    setSelectedItemsMap((prev) => {
      const newMap = multiple ? new Map(prev) : new Map();

      if (multiple) {
        if (newMap.has(variantId)) {
          newMap.delete(variantId);
        } else {
          const variant = product.variants.find((v) => v.id === variantId);
          let finalName = product.translations[0]?.name || "İsimsiz Ürün";
          if (variant) {
            const variantLabel = formatVariantLabel(variant);

            if (
              variantLabel &&
              variantLabel !== variant.id &&
              variantLabel !== variant.sku &&
              variantLabel !== "Varsayılan Varyant"
            ) {
              finalName += ` - ${variantLabel}`;
            }
          }
          newMap.set(variantId, {
            itemId: variantId,
            productName: finalName,
          });
        }
      } else {
        const variant = product.variants.find((v) => v.id === variantId);
        let finalName = product.translations[0]?.name || "İsimsiz Ürün";
        if (variant) {
          const variantLabel = formatVariantLabel(variant);

          if (
            variantLabel &&
            variantLabel !== variant.id &&
            variantLabel !== variant.sku &&
            variantLabel !== "Varsayılan Varyant"
          ) {
            finalName += ` - ${variantLabel}`;
          }
        }
        newMap.set(variantId, {
          itemId: variantId,
          productName: finalName,
        });
      }

      return newMap;
    });
  };

  const isProductSelected = (product: AdminProductTableProductData) => {
    return product.variants.every((variant) =>
      selectedItemsMap.has(variant.id),
    );
  };

  const toggleProduct = (product: AdminProductTableProductData) => {
    const allSelected = isProductSelected(product);
    setSelectedItemsMap((prev) => {
      const newMap = new Map(prev);
      product.variants.forEach((variant) => {
        if (allSelected) {
          newMap.delete(variant.id);
        } else {
          let finalName = product.translations[0]?.name || "İsimsiz Ürün";
          const variantLabel = formatVariantLabel(variant);

          if (
            variantLabel &&
            variantLabel !== variant.id &&
            variantLabel !== variant.sku &&
            variantLabel !== "Varsayılan Varyant"
          ) {
            finalName += ` - ${variantLabel}`;
          }

          newMap.set(variant.id, {
            itemId: variant.id,
            productName: finalName,
          });
        }
      });
      return newMap;
    });
  };

  const handleSubmit = () => {
    onSubmit(Array.from(selectedItemsMap.values()));
    if (onClose) onClose();
  };

  const getProductImage = (
    product: AdminProductTableProductData,
  ): string | null => {
    if (product.assets && product.assets.length > 0) {
      return product.assets[0].asset.url;
    }

    if (product.variants && product.variants.length > 0) {
      const firstVariantWithAsset = product.variants.find(
        (v) => v.assets && v.assets.length > 0,
      );
      if (firstVariantWithAsset?.assets?.[0]) {
        return firstVariantWithAsset.assets[0].asset.url;
      }
    }
    return null;
  };

  const formatVariantLabel = (
    variant: AdminProductTableProductData["variants"][number],
  ): string => {
    if (!variant.options || variant.options.length === 0) {
      return variant.sku || variant.id;
    }

    const optionLabels = variant.options.map((opt) => {
      const variantGroupName =
        opt.productVariantOption.variantOption.variantGroup.translations[0]
          ?.name || "";
      const optionName =
        opt.productVariantOption.variantOption.translations[0]?.name || "";
      return `${variantGroupName}-${optionName}`;
    });

    return optionLabels.join(" ");
  };

  return (
    <Modal
      {...props}
      onClose={onClose}
      title="Ürün Seçimi"
      size="lg"
      styles={{
        body: {
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        },
        header: {
          padding: "var(--mantine-spacing-md)",
          paddingBottom: "var(--mantine-spacing-sm)",
        },
      }}
    >
      <Stack
        gap="md"
        style={{ height: "100%", padding: "0 var(--mantine-spacing-md)" }}
      >
        <TextInput
          placeholder="Ürün ara..."
          defaultValue={searchValue}
          onChange={(e) => {
            setSearchValue(e.currentTarget.value);
            handleSearch(e.currentTarget.value);
          }}
        />

        <Stack
          gap="xs"
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            paddingRight: "4px",
          }}
        >
          {isLoading ? (
            <Loader />
          ) : data.products.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Ürün bulunamadı
            </Text>
          ) : (
            data.products.map((product) => {
              const hasVariants = product.variants.length > 1;
              const defaultVariant = product.variants.find((v) => v.isDefault);
              const productName =
                product.translations[0]?.name || "İsimsiz Ürün";
              const imageUrl = getProductImage(product);

              if (!hasVariants && defaultVariant) {
                return (
                  <Group key={product.id} gap="xs" wrap="nowrap">
                    {imageUrl && (
                      <Avatar src={imageUrl} size="md" radius="sm" />
                    )}
                    {multiple ? (
                      <Checkbox
                        style={{ flex: 1 }}
                        label={
                          <Group gap="xs">
                            <Text size="sm" fw={500}>
                              {productName}
                            </Text>
                            {defaultVariant.sku && (
                              <Badge size="sm" variant="light">
                                SKU: {defaultVariant.sku}
                              </Badge>
                            )}
                            <Badge size="sm" variant="light">
                              Stok: {defaultVariant.stock}
                            </Badge>
                          </Group>
                        }
                        checked={selectedItemsMap.has(defaultVariant.id)}
                        onChange={() =>
                          toggleSelection(defaultVariant.id, product)
                        }
                      />
                    ) : (
                      <Radio
                        style={{ flex: 1 }}
                        label={
                          <Group gap="xs">
                            <Text size="sm" fw={500}>
                              {productName}
                            </Text>
                            {defaultVariant.sku && (
                              <Badge size="sm" variant="light">
                                SKU: {defaultVariant.sku}
                              </Badge>
                            )}
                            <Badge size="sm" variant="light">
                              Stok: {defaultVariant.stock}
                            </Badge>
                          </Group>
                        }
                        checked={selectedItemsMap.has(defaultVariant.id)}
                        onChange={() =>
                          toggleSelection(defaultVariant.id, product)
                        }
                      />
                    )}
                  </Group>
                );
              }

              return (
                <Accordion
                  key={product.id}
                  variant="contained"
                  defaultValue={
                    product.variants.some((v) => selectedItemsMap.has(v.id))
                      ? product.id
                      : undefined
                  }
                >
                  <Accordion.Item value={product.id}>
                    <Accordion.Control>
                      <Group gap="xs" wrap="nowrap">
                        {multiple && (
                          <Checkbox
                            checked={isProductSelected(product)}
                            indeterminate={
                              product.variants.some((v) =>
                                selectedItemsMap.has(v.id),
                              ) && !isProductSelected(product)
                            }
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleProduct(product);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        {imageUrl && (
                          <Avatar src={imageUrl} size="md" radius="sm" />
                        )}

                        <Text size="sm" fw={500}>
                          {productName}
                        </Text>
                        <Badge size="sm" variant="light">
                          {product.variants.length} Varyant
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs" pl="md">
                        {product.variants.map((variant) => {
                          const variantLabel = formatVariantLabel(variant);
                          return multiple ? (
                            <Checkbox
                              key={variant.id}
                              label={
                                <Group gap="xs">
                                  <Text size="sm">{variantLabel}</Text>
                                  <Badge size="xs" variant="light">
                                    Stok: {variant.stock}
                                  </Badge>
                                </Group>
                              }
                              checked={selectedItemsMap.has(variant.id)}
                              onChange={() =>
                                toggleSelection(variant.id, product)
                              }
                            />
                          ) : (
                            <Radio
                              key={variant.id}
                              label={
                                <Group gap="xs">
                                  <Text size="sm">{variantLabel}</Text>
                                  <Badge size="xs" variant="light">
                                    Stok: {variant.stock}
                                  </Badge>
                                </Group>
                              }
                              checked={selectedItemsMap.has(variant.id)}
                              onChange={() =>
                                toggleSelection(variant.id, product)
                              }
                            />
                          );
                        })}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              );
            })
          )}
        </Stack>

        <Stack
          gap="md"
          style={{
            padding: "var(--mantine-spacing-md) 0",
            borderTop: "1px solid var(--mantine-color-gray-3)",
            backgroundColor: "var(--mantine-color-body)",
          }}
        >
          {data.pagination && data.pagination.totalPages > 1 && (
            <Group justify="center">
              <MantinePagination
                total={data.pagination.totalPages}
                value={data.pagination.currentPage}
                onChange={onPageChange}
              />
            </Group>
          )}

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={() => onClose?.()}>
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedItemsMap.size === 0}
            >
              Seç ({selectedItemsMap.size})
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default ProductsModal;
