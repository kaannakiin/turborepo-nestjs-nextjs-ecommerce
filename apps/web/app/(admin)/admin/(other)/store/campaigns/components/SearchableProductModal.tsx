"use client";
import GlobalLoader from "@/components/GlobalLoader";
import fetchWrapper from "@lib/fetchWrapper";
import {
  Accordion,
  Avatar,
  Button,
  Checkbox,
  Group,
  Modal,
  Radio,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { useQuery, UseQueryOptions } from "@repo/shared";
import { ProductModalData, SearchableProductModalData } from "@repo/types";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

interface SearchableProductModalProps {
  opened: boolean;
  initialProductIds: string[];
  initialVariantIds: string[];
  onConfirm: (
    productIds: string[],
    variantIds: string[],
    products: ProductModalData[]
  ) => void;
  onCancel: () => void;
  queryKey?: UseQueryOptions["queryKey"];
  multiple?: boolean;
  excludeProductIds?: string[];
  excludeVariantIds?: string[];
}

const SearchableProductModal = ({
  onConfirm,
  onCancel,
  opened,
  initialProductIds,
  initialVariantIds,
  queryKey,
  multiple = true,
  excludeProductIds = [],
  excludeVariantIds = [],
}: SearchableProductModalProps) => {
  const [search, setSearch] = useDebouncedState<string>("", 500);
  const [tempProductIds, setTempProductIds] = useState<string[]>([]);
  const [tempVariantIds, setTempVariantIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: queryKey || [
      "searchable-products-modal-data",
      {
        search,
      },
    ],
    queryFn: async () => {
      const res = await fetchWrapper.post<SearchableProductModalData>(
        `/admin/products/get-admin-searchable-product-modal-data`,
        {
          ...(search ? { search } : {}),
          page: 1,
        }
      );
      if (!res.success) {
        throw new Error("Failed to fetch products");
      }
      return res.data;
    },
    enabled: opened,
  });

  useEffect(() => {
    if (opened) {
      setTempProductIds([...initialProductIds]);
      setTempVariantIds([...initialVariantIds]);
    }
  }, [opened, initialProductIds, initialVariantIds]);

  const getProductCheckboxState = useMemo(() => {
    return (product: ProductModalData) => {
      if (!multiple || !product.sub || product.sub.length === 0) {
        return {
          checked: tempProductIds.includes(product.id),
          indeterminate: false,
        };
      }

      const selectedSubCount = product.sub.filter((sub) =>
        tempVariantIds.includes(sub.id)
      ).length;

      if (selectedSubCount === 0) {
        return { checked: false, indeterminate: false };
      } else if (selectedSubCount === product.sub.length) {
        return { checked: true, indeterminate: false };
      } else {
        return { checked: false, indeterminate: true };
      }
    };
  }, [tempProductIds, tempVariantIds, multiple]);

  const handleProductSelect = (
    productId: string,
    product: ProductModalData
  ) => {
    if (multiple) {
      if (product.sub && product.sub.length > 0) {
        const allSubIds = product.sub.map((s) => s.id);
        const allSelected = allSubIds.every((id) =>
          tempVariantIds.includes(id)
        );

        if (allSelected) {
          setTempVariantIds((prev) =>
            prev.filter((id) => !allSubIds.includes(id))
          );
        } else {
          setTempVariantIds((prev) => {
            const filtered = prev.filter((id) => !allSubIds.includes(id));
            return [...filtered, ...allSubIds];
          });
        }
      } else {
        setTempProductIds((prev) => {
          if (prev.includes(productId)) {
            return prev.filter((id) => id !== productId);
          } else {
            return [...prev, productId];
          }
        });
      }
    } else {
      setTempProductIds([productId]);
      setTempVariantIds([]);
    }
  };

  const handleSubProductSelect = (variantId: string) => {
    if (multiple) {
      setTempVariantIds((prev) => {
        if (prev.includes(variantId)) {
          return prev.filter((id) => id !== variantId);
        } else {
          return [...prev, variantId];
        }
      });
    } else {
      setTempVariantIds([variantId]);
      setTempProductIds([]);
    }
  };

  const handleConfirm = () => {
    onConfirm(tempProductIds, tempVariantIds, data?.data || []);
  };

  const handleCancel = () => {
    setTempProductIds([...initialProductIds]);
    setTempVariantIds([...initialVariantIds]);
    onCancel();
  };

  const renderProductItem = (
    product: ProductModalData,
    parentProduct?: ProductModalData
  ) => {
    const isVariant = !!parentProduct;
    const isChecked = isVariant
      ? tempVariantIds.includes(product.id)
      : tempProductIds.includes(product.id);

    const isDisabled = isVariant
      ? excludeVariantIds.includes(product.id)
      : excludeProductIds.includes(product.id);
    return (
      <UnstyledButton
        key={product.id}
        onClick={() => {
          if (isDisabled) return;
          if (isVariant) {
            handleSubProductSelect(product.id);
          } else {
            handleProductSelect(product.id, product);
          }
        }}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: "8px",
          transition: "background-color 0.2s, opacity 0.2s",
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? "not-allowed" : "pointer",
        }}
        styles={{
          root: {
            "&:hover": {
              backgroundColor: isDisabled
                ? "transparent"
                : "var(--mantine-color-gray-0)",
            },
          },
        }}
      >
        <Group gap="sm" wrap="nowrap">
          {multiple ? (
            <Checkbox
              checked={isChecked}
              onChange={() => {}}
              disabled={isDisabled}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Radio
              checked={isChecked}
              onChange={() => {}}
              disabled={isDisabled}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {product.image && (
            <Avatar src={product.image} size="sm" radius="sm" />
          )}
          <Text size="sm">{product.name}</Text>
        </Group>
      </UnstyledButton>
    );
  };

  const renderProduct = (product: ProductModalData) => {
    const checkboxState = getProductCheckboxState(product);

    if (product.sub && product.sub.length > 0) {
      const allSubsDisabled = product.sub.every((sub) =>
        excludeVariantIds.includes(sub.id)
      );
      const isParentDisabled = excludeProductIds.includes(product.id);
      const isDisabled = allSubsDisabled || isParentDisabled;

      return (
        <Accordion.Item key={product.id} value={product.id}>
          <Accordion.Control
            px={"sm"}
            disabled={isDisabled}
            style={{ opacity: isDisabled ? 0.5 : 1 }}
          >
            <Group gap="sm" wrap="nowrap">
              {multiple ? (
                <Checkbox
                  checked={checkboxState.checked}
                  indeterminate={checkboxState.indeterminate}
                  disabled={isDisabled}
                  onChange={() => {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isDisabled) return;
                    handleProductSelect(product.id, product);
                  }}
                />
              ) : (
                <Radio
                  checked={tempProductIds.includes(product.id)}
                  disabled={isDisabled}
                  onChange={() => {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isDisabled) return;
                    handleProductSelect(product.id, product);
                  }}
                />
              )}
              {product.image && (
                <Avatar src={product.image} size="sm" radius="sm" />
              )}
              <Text size="sm" fw={500} c={isDisabled ? "dimmed" : "inherit"}>
                {product.name}
              </Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs" pl="md">
              {product.sub.map((subProduct) =>
                renderProductItem(subProduct, product)
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      );
    }

    return renderProductItem(product);
  };

  return (
    <Modal.Root opened={opened} onClose={handleCancel} centered size={"lg"}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Ürün Seç</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <Stack gap="md">
            <Group gap={"md"}>
              <TextInput
                defaultValue={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                variant="filled"
                rightSection={<IconSearch />}
                placeholder="Ürün Ara"
                style={{ flex: 1 }}
              />
            </Group>

            {isLoading ? (
              <GlobalLoader />
            ) : (
              <>
                {data && data.data && data.data.length > 0 ? (
                  <ScrollArea h={400}>
                    <Accordion className="space-y-3" variant="separated">
                      {data.data.map((product) => renderProduct(product))}
                    </Accordion>
                  </ScrollArea>
                ) : (
                  <Text c="dimmed" ta="center" py="xl">
                    Ürün bulunamadı
                  </Text>
                )}
              </>
            )}

            <Group justify="flex-end" gap="sm">
              <Button variant="subtle" onClick={handleCancel}>
                Vazgeç
              </Button>
              <Button onClick={handleConfirm}>Onayla</Button>
            </Group>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default SearchableProductModal;
