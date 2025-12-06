import fetchWrapper from "@lib/fetchWrapper";
import {
  ActionIcon,
  AspectRatio,
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  Group,
  Loader,
  Modal,
  Pagination,
  Radio,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useQuery } from "@repo/shared";
import { ProductSelectResult, SearchableProductModalResponseType } from "@repo/types";
import { IconChevronDown, IconChevronRight, IconSearch, IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import TableAsset from "../../(admin)/components/TableAsset";

interface ProductModalWithImageProps {
  onSubmit: (data: ProductSelectResult | Array<ProductSelectResult>) => void;
  initialData?: ProductSelectResult | Array<ProductSelectResult> | null;
  opened: boolean;
  onClose: () => void;
  multiple?: boolean;
}

interface ProductRowProps {
  item: ProductSelectResult;
  selectedItems: ProductSelectResult[];
  onSelect: (item: ProductSelectResult) => void;
  multiple: boolean;
  isChild?: boolean;
  inSelectedSection?: boolean;
}

const ProductRow = ({
  item,
  selectedItems,
  onSelect,
  multiple,
  isChild = false,
  inSelectedSection = false,
}: ProductRowProps) => {
  const [opened, { toggle }] = useDisclosure(false);

  const isSelected = selectedItems.some((i) => i.id === item.id);
  const hasVariants = item.variants && item.variants.length > 0;

  const shouldIndent = isChild && !inSelectedSection;

  const SelectionControl = multiple ? (
    <Checkbox checked={isSelected} readOnly tabIndex={-1} size="sm" style={{ cursor: "pointer" }} />
  ) : (
    <Radio checked={isSelected} readOnly tabIndex={-1} size="sm" style={{ cursor: "pointer" }} />
  );

  return (
    <Box>
      <Group wrap="nowrap" align="center" gap={0} bg={isSelected ? "var(--mantine-color-blue-0)" : "transparent"}>
        <UnstyledButton
          onClick={() => onSelect(item)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderBottom: !isChild && !hasVariants ? "1px solid var(--mantine-color-gray-2)" : "none",
          }}
        >
          <Group wrap="nowrap" gap="sm">
            <Box ml={shouldIndent ? 24 : 0} style={{ flexShrink: 0 }}>
              {SelectionControl}
            </Box>

            {item?.image && (
              <AspectRatio ratio={1} maw={64} pos={"relative"}>
                <TableAsset withModal={false} type={item.image?.type} url={item.image?.url || ""} />
              </AspectRatio>
            )}

            <Box style={{ flex: 1, overflow: "hidden" }}>
              <Group gap="xs">
                <Text size="sm" fw={isChild ? 400 : 500} lineClamp={1}>
                  {item.name}
                </Text>
              </Group>
            </Box>
          </Group>
        </UnstyledButton>

        {hasVariants && (
          <ActionIcon variant="subtle" color="gray" onClick={toggle} mr="sm" style={{ flexShrink: 0 }}>
            {opened ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
          </ActionIcon>
        )}
      </Group>

      {hasVariants && (
        <Collapse in={opened}>
          <Stack gap={0} style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
            {item.variants?.map((variant) => (
              <ProductRow
                key={variant.id}
                item={variant}
                selectedItems={selectedItems}
                onSelect={onSelect}
                multiple={multiple}
                isChild={true}
                inSelectedSection={inSelectedSection}
              />
            ))}
          </Stack>
        </Collapse>
      )}

      {!isChild && !hasVariants && <Box style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }} />}
    </Box>
  );
};

const SelectableProductModal = ({
  onSubmit,
  initialData,
  opened,
  onClose,
  multiple = false,
}: ProductModalWithImageProps) => {
  const [activePage, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const [selectedItems, setSelectedItems] = useState<ProductSelectResult[]>([]);

  const [selectedSectionOpened, { toggle: toggleSelectedSection }] = useDisclosure(!multiple);

  useEffect(() => {
    if (opened && initialData) {
      const items = Array.isArray(initialData) ? initialData : [initialData];
      setSelectedItems(items);
    } else if (opened && !initialData) {
      setSelectedItems([]);
    }
  }, [opened, initialData]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const initialIdsPayload = useMemo(() => {
    if (!initialData) return [];
    const items = Array.isArray(initialData) ? initialData : [initialData];
    return items.map((item) => ({ id: item.id, isVariant: item.isVariant }));
  }, [initialData]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["product-modal-select", debouncedSearch, activePage, initialIdsPayload],
    queryFn: async () => {
      const response = await fetchWrapper.post<SearchableProductModalResponseType>(
        "/admin/themev2/selectable-modal-products",
        {
          search: debouncedSearch,
          page: activePage,
          limit: 10,
          initialIds: initialIdsPayload,
        }
      );

      if (!response.success) throw new Error("Fetch failed");
      return response.data;
    },
    enabled: opened,
  });

  const productList = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleSelect = (item: ProductSelectResult) => {
    if (multiple) {
      const isSelected = selectedItems.some((i) => i.id === item.id);

      if (!item.isVariant && item.variants && item.variants.length > 0) {
        if (isSelected) {
          const childrenIds = item.variants.map((v) => v.id);
          setSelectedItems((prev) => prev.filter((i) => i.id !== item.id && !childrenIds.includes(i.id)));
        } else {
          const children = item.variants;
          const newItems = [item, ...children].filter(
            (newItem) => !selectedItems.some((existing) => existing.id === newItem.id)
          );
          setSelectedItems((prev) => [...prev, ...newItems]);
        }
        return;
      }

      if (isSelected) {
        setSelectedItems((prev) => {
          const remaining = prev.filter((i) => i.id !== item.id);

          return remaining.filter((parent) => {
            if (parent.variants?.some((v) => v.id === item.id)) {
              return false;
            }
            return true;
          });
        });
      } else {
        setSelectedItems((prev) => [...prev, item]);
      }
    } else {
      setSelectedItems([item]);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      onSubmit(selectedItems);
    } else {
      if (selectedItems.length > 0) {
        onSubmit(selectedItems[0]);
      }
    }
    onClose();
  };

  const visibleSelectedItems = useMemo(() => {
    return selectedItems.filter((item) => {
      const isChildOfSelectedParent = selectedItems.some((parent) =>
        parent.variants?.some((child) => child.id === item.id)
      );
      return !isChildOfSelectedParent;
    });
  }, [selectedItems]);

  return (
    <Modal opened={opened} onClose={onClose} title="Ürün Seçimi" size="lg" scrollAreaComponent={ScrollArea.Autosize}>
      <Stack gap="md">
        <TextInput
          placeholder="Ürün adı, SKU veya barkod ara..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          rightSection={
            search && (
              <ActionIcon variant="transparent" onClick={() => setSearch("")}>
                <IconX size={14} />
              </ActionIcon>
            )
          }
        />

        <ScrollArea h={400} type="always" offsetScrollbars>
          <Stack gap={0}>
            {isLoading || isFetching ? (
              <Flex justify="center" align="center" h={200}>
                <Loader size="sm" />
              </Flex>
            ) : (
              <>
                {/* --- SEÇİLİ ÜRÜNLER BÖLÜMÜ --- */}
                {selectedItems.length > 0 && !debouncedSearch && activePage === 1 && (
                  <Box>
                    <UnstyledButton onClick={toggleSelectedSection} style={{ width: "100%" }}>
                      <Group
                        justify="space-between"
                        px="sm"
                        py="xs"
                        bg="gray.0"
                        style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
                      >
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                          Seçili Ürünler ({selectedItems.length})
                        </Text>
                        <ActionIcon variant="subtle" color="gray" size="sm" component="span">
                          {selectedSectionOpened ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                        </ActionIcon>
                      </Group>
                    </UnstyledButton>
                    <Collapse in={selectedSectionOpened}>
                      <Stack gap={0}>
                        {/* Burada filtrelenmiş listeyi kullanıyoruz */}
                        {visibleSelectedItems.map((item) => (
                          <ProductRow
                            key={`selected-${item.id}`}
                            item={item}
                            selectedItems={selectedItems}
                            multiple={multiple}
                            onSelect={handleSelect}
                            inSelectedSection={true}
                          />
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>
                )}

                {(debouncedSearch || productList.length > 0) && (
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    px="sm"
                    py="xs"
                    bg="gray.0"
                    mt={selectedItems.length > 0 && activePage === 1 && !debouncedSearch ? "sm" : 0}
                  >
                    Tüm Ürünler (Sayfa {activePage})
                  </Text>
                )}

                {productList.map((item) => (
                  <ProductRow
                    key={item.id}
                    item={item}
                    selectedItems={selectedItems}
                    multiple={multiple}
                    onSelect={handleSelect}
                  />
                ))}

                {!isLoading && productList.length === 0 && selectedItems.length === 0 && (
                  <Flex justify="center" align="center" h={150} direction="column">
                    <Text c="dimmed">Sonuç bulunamadı</Text>
                  </Flex>
                )}
              </>
            )}
          </Stack>
        </ScrollArea>

        <Stack gap="xs" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
          {totalPages > 1 && (
            <Flex justify="center">
              <Pagination total={totalPages} value={activePage} onChange={setPage} size="sm" />
            </Flex>
          )}

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {selectedItems.length} ürün seçildi
            </Text>
            <Group>
              <Button variant="default" onClick={onClose}>
                İptal
              </Button>
              <Button onClick={handleConfirm}>Seçimi Tamamla</Button>
            </Group>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default SelectableProductModal;
