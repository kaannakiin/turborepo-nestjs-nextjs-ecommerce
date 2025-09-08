"use client";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Center,
  Radio,
  Alert,
} from "@mantine/core";
import { useQuery } from "@repo/shared";
import { ProductWithVariants } from "@repo/types";
import {
  IconChevronDown,
  IconChevronRight,
  IconPackage,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import GlobalLoadingOverlay from "../../../../../components/GlobalLoadingOverlay";

type SelectionMode = "multiple" | "single";

interface ProductsModalProps {
  opened: boolean;
  onClose: () => void;
  includedProductIds: string[];
  includedVariantIds: string[];
  onSelectionChange?: (productIds: string[], variantIds: string[]) => void;
  // Buy X Get Y için yeni prop'lar
  mode?: SelectionMode;
  title?: string;
  singleProductId?: string | null;
  singleVariantId?: string | null;
  onSingleSelectionChange?: (productId?: string, variantId?: string) => void;
}

const ProductsModal = ({
  opened,
  onClose,
  includedProductIds,
  includedVariantIds,
  onSelectionChange,
  mode = "multiple",
  title,
  singleProductId,
  singleVariantId,
  onSingleSelectionChange,
}: ProductsModalProps) => {
  const [selectedProductIds, setSelectedProductIds] =
    useState<string[]>(includedProductIds);
  const [selectedVariantIds, setSelectedVariantIds] =
    useState<string[]>(includedVariantIds);
  const [openedProducts, setOpenedProducts] = useState<string[]>([]);

  // Single selection için state
  const [selectedSingleProductId, setSelectedSingleProductId] = useState<
    string | undefined
  >(singleProductId || undefined);
  const [selectedSingleVariantId, setSelectedSingleVariantId] = useState<
    string | undefined
  >(singleVariantId || undefined);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["get-products-and-variants"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/get-products-and-variants`,
        { method: "GET", credentials: "include" }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data as ProductWithVariants[];
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // İlk render'da state'i sync et
  useEffect(() => {
    if (mode === "multiple") {
      setSelectedProductIds(includedProductIds);
      setSelectedVariantIds(includedVariantIds);
    } else {
      setSelectedSingleProductId(singleProductId || undefined);
      setSelectedSingleVariantId(singleVariantId || undefined);
    }
  }, [
    includedProductIds,
    includedVariantIds,
    singleProductId,
    singleVariantId,
    mode,
  ]);

  const notifySelectionChange = (
    productIds: string[],
    variantIds: string[]
  ) => {
    onSelectionChange?.(productIds, variantIds);
  };

  const notifySingleSelectionChange = (
    productId?: string,
    variantId?: string
  ) => {
    onSingleSelectionChange?.(productId, variantId);
  };

  const handleSave = () => {
    if (mode === "multiple") {
      notifySelectionChange(selectedProductIds, selectedVariantIds);
    } else {
      notifySingleSelectionChange(
        selectedSingleProductId,
        selectedSingleVariantId
      );
    }
    onClose();
  };

  const toggleProductCollapse = (productId: string) => {
    setOpenedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSingleSelection = (productId: string, variantId?: string) => {
    if (variantId) {
      // Variant selected - clear product selection
      setSelectedSingleVariantId(variantId);
      setSelectedSingleProductId(undefined);
    } else {
      // Product selected - clear variant selection
      setSelectedSingleProductId(productId);
      setSelectedSingleVariantId(undefined);
    }
  };

  // Multiple mode için checkbox handlers (önceki kod)
  const handleProductCheck = (
    product: ProductWithVariants,
    checked: boolean
  ) => {
    let newProductIds = [...selectedProductIds];
    let newVariantIds = [...selectedVariantIds];

    if (product.isVariant) {
      const allVariantIds = product.variantInfo?.map((v) => v.variantId) || [];

      if (checked) {
        newVariantIds = [...new Set([...newVariantIds, ...allVariantIds])];
        newProductIds = [...new Set([...newProductIds, product.productId])];
      } else {
        newVariantIds = newVariantIds.filter(
          (id) => !allVariantIds.includes(id)
        );
        newProductIds = newProductIds.filter((id) => id !== product.productId);
      }
    } else {
      if (checked) {
        newProductIds = [...new Set([...newProductIds, product.productId])];
      } else {
        newProductIds = newProductIds.filter((id) => id !== product.productId);
      }
    }

    setSelectedProductIds(newProductIds);
    setSelectedVariantIds(newVariantIds);
  };

  const handleVariantCheck = (
    productId: string,
    variantId: string,
    checked: boolean
  ) => {
    let newProductIds = [...selectedProductIds];
    let newVariantIds = [...selectedVariantIds];

    if (checked) {
      newVariantIds = [...new Set([...newVariantIds, variantId])];
    } else {
      newVariantIds = newVariantIds.filter((id) => id !== variantId);

      const product = data?.find((p) => p.productId === productId);
      const remainingVariants = newVariantIds.filter((id) =>
        product?.variantInfo?.some((v) => v.variantId === id)
      );

      if (remainingVariants.length === 0) {
        newProductIds = newProductIds.filter((id) => id !== productId);
      }
    }

    setSelectedProductIds(newProductIds);
    setSelectedVariantIds(newVariantIds);
  };

  const isProductChecked = (product: ProductWithVariants) => {
    if (product.isVariant) {
      const allVariantIds = product.variantInfo?.map((v) => v.variantId) || [];
      return (
        allVariantIds.every((id) => selectedVariantIds.includes(id)) &&
        allVariantIds.length > 0
      );
    }
    return selectedProductIds.includes(product.productId);
  };

  const isProductIndeterminate = (product: ProductWithVariants) => {
    if (product.isVariant) {
      const allVariantIds = product.variantInfo?.map((v) => v.variantId) || [];
      const selectedCount = allVariantIds.filter((id) =>
        selectedVariantIds.includes(id)
      ).length;
      return selectedCount > 0 && selectedCount < allVariantIds.length;
    }
    return false;
  };

  const formatVariantName = (
    variants: { groupName: string; optionName: string }[]
  ) => {
    return variants.map((v) => `${v.groupName}: ${v.optionName}`).join(", ");
  };

  const getSelectedCount = () => {
    if (mode === "single") {
      return {
        regularProducts: selectedSingleProductId ? 1 : 0,
        variants: selectedSingleVariantId ? 1 : 0,
      };
    }

    const regularProducts = selectedProductIds.filter(
      (id) => !data?.find((p) => p.productId === id)?.isVariant
    ).length;
    const variants = selectedVariantIds.length;
    return { regularProducts, variants };
  };

  const { regularProducts, variants } = getSelectedCount();

  const getSelectedProductName = () => {
    if (selectedSingleProductId) {
      const product = data?.find(
        (p) => p.productId === selectedSingleProductId
      );
      // For variant products, show that any variant can be selected
      const isVariantProduct =
        product?.isVariant &&
        product?.variantInfo &&
        product.variantInfo.length > 0;
      return isVariantProduct
        ? `${product?.productName} (herhangi bir varyant)`
        : product?.productName;
    }
    if (selectedSingleVariantId) {
      const product = data?.find((p) =>
        p.variantInfo?.some((v) => v.variantId === selectedSingleVariantId)
      );
      const variant = product?.variantInfo?.find(
        (v) => v.variantId === selectedSingleVariantId
      );
      return variant
        ? `${product?.productName} - ${formatVariantName(variant.variants)}`
        : "";
    }
    return null;
  };

  return (
    <Modal
      centered
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: "100%" }}>
          <Text fw={600}>{title || "Ürün Seç"}</Text>
          {mode === "multiple" && (regularProducts > 0 || variants > 0) && (
            <Text size="sm" c="dimmed">
              {regularProducts > 0 && `${regularProducts} ürün`}
              {regularProducts > 0 && variants > 0 && ", "}
              {variants > 0 && `${variants} varyant`} seçili
            </Text>
          )}
          {mode === "single" && (regularProducts > 0 || variants > 0) && (
            <Text size="sm" c="dimmed">
              1 {selectedSingleVariantId ? "varyant" : "ürün"} seçili
            </Text>
          )}
        </Group>
      }
      size="lg"
      className="relative"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {mode === "single" && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          mb="md"
        >
          <Text size="sm">
            Sadece bir ürün veya varyant seçebilirsiniz.
            {getSelectedProductName() && (
              <Text component="span" fw={500} ml={4}>
                Seçili: {getSelectedProductName()}
              </Text>
            )}
          </Text>
        </Alert>
      )}

      {isLoading || isFetching ? (
        <GlobalLoadingOverlay />
      ) : error ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconPackage size={48} color="var(--mantine-color-red-6)" />
            <Text c="red" fw={500}>
              Ürünler yüklenirken bir hata oluştu
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin
            </Text>
          </Stack>
        </Center>
      ) : !data || data.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconPackage size={48} color="var(--mantine-color-gray-6)" />
            <Text fw={500} c="dimmed">
              Henüz ürün bulunamadı
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Önce ürün ekledikten sonra buradan seçim yapabilirsiniz
            </Text>
          </Stack>
        </Center>
      ) : (
        <>
          <ScrollArea.Autosize mah={400}>
            <Stack gap="sm">
              {data.map((product) => (
                <Box key={product.productId}>
                  <Group gap="xs" align="center" wrap="nowrap">
                    {mode === "multiple" ? (
                      <Checkbox
                        checked={isProductChecked(product)}
                        indeterminate={isProductIndeterminate(product)}
                        onChange={(event) =>
                          handleProductCheck(
                            product,
                            event.currentTarget.checked
                          )
                        }
                      />
                    ) : (
                      <Radio
                        checked={selectedSingleProductId === product.productId}
                        onChange={() =>
                          handleSingleSelection(product.productId)
                        }
                      />
                    )}

                    {product.isVariant &&
                    product.variantInfo &&
                    product.variantInfo.length > 0 ? (
                      <Group
                        gap="xs"
                        style={{ flex: 1, cursor: "pointer" }}
                        onClick={() => toggleProductCollapse(product.productId)}
                      >
                        <ActionIcon variant="subtle" size="sm">
                          {openedProducts.includes(product.productId) ? (
                            <IconChevronDown size={16} />
                          ) : (
                            <IconChevronRight size={16} />
                          )}
                        </ActionIcon>
                        <Text fz="sm" fw={500}>
                          {product.productName}
                          <Text component="span" fz="xs" c="dimmed" ml="xs">
                            ({product.variantInfo.length} varyant)
                          </Text>
                        </Text>
                      </Group>
                    ) : (
                      <Text fz="sm">{product.productName}</Text>
                    )}
                  </Group>

                  {product.isVariant && product.variantInfo && (
                    <Collapse in={openedProducts.includes(product.productId)}>
                      <Stack gap="xs" ml="md" mt="xs">
                        <Divider size="xs" />
                        {product.variantInfo.map((variant) => (
                          <Group
                            key={variant.variantId}
                            gap="xs"
                            align="center"
                          >
                            {mode === "multiple" ? (
                              <Checkbox
                                checked={isProductChecked(product)}
                                indeterminate={isProductIndeterminate(product)}
                                onChange={(event) =>
                                  handleProductCheck(
                                    product,
                                    event.currentTarget.checked
                                  )
                                }
                              />
                            ) : (
                              <Radio
                                checked={
                                  selectedSingleProductId === product.productId
                                }
                                onChange={() =>
                                  handleSingleSelection(product.productId)
                                }
                              />
                            )}

                            <Text fz="xs" c="dimmed">
                              {formatVariantName(variant.variants)}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    </Collapse>
                  )}
                </Box>
              ))}
            </Stack>
          </ScrollArea.Autosize>

          <Divider my="md" />
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={onClose}>
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                mode === "single" &&
                !selectedSingleProductId &&
                !selectedSingleVariantId
              }
            >
              Seçimi Kaydet
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
};

export default ProductsModal;
