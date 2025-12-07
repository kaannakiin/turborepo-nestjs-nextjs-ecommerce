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
import { SubmitHandler, useQuery } from "@repo/shared";
import {
  ProductSelectResult,
  SearchableProductModalResponseType,
} from "@repo/types";
import {
  IconChevronDown,
  IconChevronRight,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import TableAsset from "../../(admin)/components/TableAsset";

export type SimplifiedProductSelection = {
  id: string;
  isVariant: boolean;
  name: string;
};

interface ProductModalWithImageProps {
  onSubmit: SubmitHandler<
    SimplifiedProductSelection | Array<SimplifiedProductSelection>
  >;

  initialData?:
    | SimplifiedProductSelection
    | Array<SimplifiedProductSelection>
    | null;
  opened: boolean;
  onClose: () => void;
  multiple?: boolean;
}

interface ProductRowProps {
  item: ProductSelectResult;

  selectedItems: SimplifiedProductSelection[];
  onSelect: (item: ProductSelectResult) => void;
  multiple: boolean;
  isChild?: boolean;
}

const ProductRow = ({
  item,
  selectedItems,
  onSelect,
  multiple,
  isChild = false,
}: ProductRowProps) => {
  const [opened, { toggle }] = useDisclosure(false);
  const hasVariants = item.variants && item.variants.length > 0;

  let isSelected = false;
  let isIndeterminate = false;

  if (hasVariants) {
    const childrenIds = item.variants!.map((v) => v.id);

    const selectedChildrenCount = selectedItems.filter((i) =>
      childrenIds.includes(i.id)
    ).length;

    if (
      selectedChildrenCount === item.variants!.length &&
      item.variants!.length > 0
    ) {
      isSelected = true;
    } else if (selectedChildrenCount > 0) {
      isIndeterminate = true;
    }
  } else {
    isSelected = selectedItems.some((i) => i.id === item.id);
  }

  const handleRowClick = () => {
    if (hasVariants && !multiple) {
      toggle();
      return;
    }
    onSelect(item);
  };

  const SelectionControl = useMemo(() => {
    if (multiple) {
      return (
        <Checkbox
          checked={isSelected}
          indeterminate={isIndeterminate}
          readOnly
          tabIndex={-1}
          size="sm"
          style={{ cursor: "pointer" }}
        />
      );
    } else {
      if (hasVariants) return <Box w={20} />;

      return (
        <Radio
          checked={isSelected}
          readOnly
          tabIndex={-1}
          size="sm"
          style={{ cursor: "pointer" }}
        />
      );
    }
  }, [multiple, isSelected, isIndeterminate, hasVariants]);

  return (
    <Box>
      <Group
        wrap="nowrap"
        align="center"
        gap={0}
        bg={isSelected ? "var(--mantine-color-blue-0)" : "transparent"}
      >
        <UnstyledButton
          onClick={handleRowClick}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderBottom:
              !isChild && !hasVariants
                ? "1px solid var(--mantine-color-gray-2)"
                : "none",
          }}
        >
          <Group wrap="nowrap" gap="sm">
            <Box ml={isChild ? 24 : 0} style={{ flexShrink: 0 }}>
              {SelectionControl}
            </Box>

            {item?.image && (
              <AspectRatio ratio={1} maw={64} pos={"relative"}>
                <TableAsset
                  withModal={false}
                  type={item.image?.type}
                  url={item.image?.url || ""}
                />
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
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={toggle}
            mr="sm"
            style={{ flexShrink: 0 }}
          >
            {opened ? (
              <IconChevronDown size={18} />
            ) : (
              <IconChevronRight size={18} />
            )}
          </ActionIcon>
        )}
      </Group>

      {hasVariants && (
        <Collapse in={opened}>
          <Stack
            gap={0}
            style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
          >
            {item.variants?.map((variant) => (
              <ProductRow
                key={variant.id}
                item={variant}
                selectedItems={selectedItems}
                onSelect={onSelect}
                multiple={multiple}
                isChild={true}
              />
            ))}
          </Stack>
        </Collapse>
      )}
      {!isChild && !hasVariants && (
        <Box
          style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
        />
      )}
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

  const [selectedItems, setSelectedItems] = useState<
    SimplifiedProductSelection[]
  >([]);

  const [apiInitialIds, setApiInitialIds] = useState<
    { id: string; isVariant: boolean }[]
  >([]);

  useEffect(() => {
    if (opened) {
      const items = initialData
        ? Array.isArray(initialData)
          ? initialData
          : [initialData]
        : [];

      setSelectedItems(items);

      const idsPayload = items.map((item) => ({
        id: item.id,
        isVariant: item.isVariant,
      }));
      setApiInitialIds(idsPayload);

      setPage(1);
      setSearch("");
    } else {
      setSelectedItems([]);
      setApiInitialIds([]);
    }
  }, [opened, initialData]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "product-modal-select",
      debouncedSearch,
      activePage,

      apiInitialIds,
    ],
    queryFn: async () => {
      const response =
        await fetchWrapper.post<SearchableProductModalResponseType>(
          "/admin/themev2/selectable-modal-products",
          {
            search: debouncedSearch,
            page: activePage,
            limit: 10,
            initialIds: apiInitialIds,
          }
        );
      if (!response.success) throw new Error("Fetch failed");
      return response.data;
    },
    enabled: opened,

    placeholderData: (previousData) => previousData,
  });

  const productList = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleSelect = (item: ProductSelectResult) => {
    const hasVariants =
      !item.isVariant && item.variants && item.variants.length > 0;

    if (multiple) {
      if (hasVariants) {
        const children = item.variants || [];
        const childrenIds = children.map((c) => c.id);

        const allSelected = children.every((child) =>
          selectedItems.some((s) => s.id === child.id)
        );

        if (allSelected) {
          setSelectedItems((prev) =>
            prev.filter((i) => !childrenIds.includes(i.id))
          );
        } else {
          const newItemsToAdd = children
            .filter((child) => !selectedItems.some((s) => s.id === child.id))
            .map((child) => ({
              id: child.id,
              isVariant: child.isVariant,
              name: child.name,
            }));

          setSelectedItems((prev) => [...prev, ...newItemsToAdd]);
        }
      } else {
        const isSelected = selectedItems.some((i) => i.id === item.id);
        if (isSelected) {
          setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
        } else {
          const newItem: SimplifiedProductSelection = {
            id: item.id,
            isVariant: item.isVariant,
            name: item.name,
          };
          setSelectedItems((prev) => [...prev, newItem]);
        }
      }
      return;
    } else {
      if (hasVariants) {
        return;
      }

      const newItem: SimplifiedProductSelection = {
        id: item.id,
        isVariant: item.isVariant,
        name: item.name,
      };
      setSelectedItems([newItem]);
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

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Ürün Seçimi"
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
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
            {isLoading && !isFetching && productList.length === 0 ? (
              <Flex justify="center" align="center" h={200}>
                <Loader size="sm" />
              </Flex>
            ) : (
              <>
                {/* Loader'ı fetching durumunda şeffaf bir overlay gibi de gösterebilirsin */}
                <Box
                  pos="relative"
                  style={{
                    opacity: isFetching ? 0.6 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {productList.map((item) => (
                    <ProductRow
                      key={item.id}
                      item={item}
                      selectedItems={selectedItems}
                      multiple={multiple}
                      onSelect={handleSelect}
                    />
                  ))}
                </Box>

                {!isLoading && productList.length === 0 && (
                  <Flex
                    justify="center"
                    align="center"
                    h={150}
                    direction="column"
                  >
                    <Text c="dimmed">Sonuç bulunamadı</Text>
                  </Flex>
                )}
              </>
            )}
          </Stack>
        </ScrollArea>

        <Stack
          gap="xs"
          pt="sm"
          style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
        >
          {totalPages > 1 && (
            <Flex justify="center">
              <Pagination
                total={totalPages}
                value={activePage}
                onChange={setPage}
                size="sm"
              />
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
