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
  Radio, // YENİ: Radio import edildi
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
  multiple?: boolean; // YENİ: multiple prop'u eklendi
}

const SearchableProductModal = ({
  onConfirm,
  onCancel,
  opened,
  initialProductIds,
  initialVariantIds,
  queryKey,
  multiple = true, // YENİ: default değeri true olarak ayarlandı
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
          // Not: "alreadySelectedIds" prop'u sorgudan kaldırıldı,
          // çünkü bu genellikle arama sonuçlarını filtrelemek yerine
          // seçili olanları göstermek için kullanılır.
          // Eğer API'niz bunu gerektiriyorsa geri ekleyebilirsiniz.
          // alreadySelectedIds: {
          //   productIds: tempProductIds,
          //   variantIds: tempVariantIds,
          // },
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

  // GÜNCELLENDİ: Bu fonksiyon artık sadece multiple=true ise kullanılıyor.
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
      // --- ÇOKLU SEÇİM MANTIĞI (İstediğin gibi çalışıyor) ---
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
      // --- YENİ TEKLİ SEÇİM MANTIĞI ---
      // İster varyantı olsun (Accordion) ister olmasın (Item),
      // ana ürüne tıklamak direkt o ürünü seçer ve varyant seçimini temizler.
      setTempProductIds([productId]);
      setTempVariantIds([]); // Diğer seçimi temizle
    }
  };

  // GÜNCELLENDİ: Seçim mantığı 'multiple' prop'una göre değişiyor.
  const handleSubProductSelect = (variantId: string) => {
    if (multiple) {
      // --- ÇOKLU SEÇİM MANTIĞI (MEVCUT) ---
      setTempVariantIds((prev) => {
        if (prev.includes(variantId)) {
          return prev.filter((id) => id !== variantId);
        } else {
          return [...prev, variantId];
        }
      });
    } else {
      // --- TEKLİ SEÇİM MANTIĞI (YENİ) ---
      setTempVariantIds([variantId]);
      setTempProductIds([]); // Diğer seçimi temizle
    }
  };

  const handleConfirm = () => {
    onConfirm(tempProductIds, tempVariantIds, data?.data || []);
  };

  const handleCancel = () => {
    // İptal edildiğinde state'i sıfırlamak yerine ilk değerlere dön
    setTempProductIds([...initialProductIds]);
    setTempVariantIds([...initialVariantIds]);
    onCancel();
  };

  // GÜNCELLENDİ: Checkbox veya Radio render eder.
  const renderProductItem = (
    product: ProductModalData,
    parentProduct?: ProductModalData
  ) => {
    const isVariant = !!parentProduct;
    const isChecked = isVariant
      ? tempVariantIds.includes(product.id)
      : tempProductIds.includes(product.id);

    return (
      <UnstyledButton
        key={product.id}
        onClick={() => {
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
          transition: "background-color 0.2s",
        }}
        styles={{
          root: {
            "&:hover": {
              backgroundColor: "var(--mantine-color-gray-0)",
            },
          },
        }}
      >
        <Group gap="sm" wrap="nowrap">
          {/* YENİ: multiple prop'una göre Checkbox veya Radio göster */}
          {multiple ? (
            <Checkbox
              checked={isChecked}
              onChange={() => {}} // onClick ile yönetiliyor
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Radio
              checked={isChecked}
              onChange={() => {}} // onClick ile yönetiliyor
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
      return (
        <Accordion.Item key={product.id} value={product.id}>
          <Accordion.Control px={"sm"}>
            <Group gap="sm" wrap="nowrap">
              {/* YENİ: multiple=true ise Checkbox, false ise Radio göster */}
              {multiple ? (
                <Checkbox
                  checked={checkboxState.checked}
                  indeterminate={checkboxState.indeterminate}
                  onChange={() => {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductSelect(product.id, product);
                  }}
                />
              ) : (
                <Radio
                  checked={tempProductIds.includes(product.id)}
                  onChange={() => {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductSelect(product.id, product);
                  }}
                />
              )}
              {product.image && (
                <Avatar src={product.image} size="sm" radius="sm" />
              )}
              <Text size="sm" fw={500}>
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

    // Varyantı olmayan basit ürün
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
                style={{ flex: 1 }} // Arama çubuğunun genişlemesi için
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
