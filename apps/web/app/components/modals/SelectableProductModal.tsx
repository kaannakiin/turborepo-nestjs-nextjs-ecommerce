import fetchWrapper from "@lib/fetchWrapper";
import {
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  Collapse,
  Group,
  Modal,
  ModalProps,
  Pagination,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { useQuery } from "@repo/shared";
import { SearchableProductModalResponseType } from "@repo/types";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import GlobalLoader from "../GlobalLoader";

interface SelectableProductModalProps {
  multiple: boolean;
  opened: boolean;
  onClose: () => void;
  props?: Omit<ModalProps, "opened" | "onClose">;
  selectedIds?: string[];
  onSubmit: (
    selectedProducts: SearchableProductModalResponseType["data"][number][]
  ) => void;
}

const SelectableProductModal = ({
  multiple,
  onClose,
  opened,
  props,
  selectedIds = [],
  onSubmit,
}: SelectableProductModalProps) => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [search, setSearch] = useDebouncedState<string>("", 500);

  const [localSelected, setLocalSelected] = useState<
    SearchableProductModalResponseType["data"][number][]
  >([]);

  const [expandedParents, setExpandedParents] = useState<string[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["selectable-products-modal", { page, limit, search }],
    queryFn: async () => {
      const res = await fetchWrapper.get<SearchableProductModalResponseType>(
        "/admin/themev2/selectable-products",
        {
          params: { limit, page, search: search ? search.trim() : undefined },
        }
      );
      if (!res.success) throw new Error("Failed to fetch products");
      if (!res.data.success) throw new Error("Failed to fetch products data");
      return res.data;
    },
    enabled: opened,
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  const isSelected = (id: string) => {
    return (
      selectedIds.includes(id) || localSelected.some((item) => item.id === id)
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedParents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSingleSelect = (
    product: SearchableProductModalResponseType["data"][number]
  ) => {
    setLocalSelected((prev) => {
      const exists = prev.find((p) => p.id === product.id);

      if (multiple) {
        if (exists) return prev.filter((p) => p.id !== product.id);
        return [...prev, product];
      } else {
        return exists ? [] : [product];
      }
    });
  };

  const handleParentSelect = (
    parent: SearchableProductModalResponseType["data"][number]
  ) => {
    if (!parent.variants) return;

    if (!multiple) {
      toggleExpand(parent.id);
      return;
    }

    const allVariantIds = parent.variants.map((v) => v.id);
    const selectedVariantIds = localSelected.map((p) => p.id);

    const isAllSelected = allVariantIds.every((id) =>
      selectedVariantIds.includes(id)
    );

    setLocalSelected((prev) => {
      if (isAllSelected) {
        return prev.filter((p) => !allVariantIds.includes(p.id));
      } else {
        const newVariants = parent.variants!.filter(
          (v) => !prev.some((selected) => selected.id === v.id)
        );
        return [...prev, ...newVariants];
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(localSelected);
    onClose();
  };

  const renderRow = (
    item: SearchableProductModalResponseType["data"][number],
    isChild = false
  ) => {
    const hasVariants = item.variants && item.variants.length > 0;
    const itemIsSelected = isSelected(item.id);
    const isExpanded = expandedParents.includes(item.id);

    const isSelectable = multiple || !hasVariants;

    let parentChecked = false;
    let parentIndeterminate = false;

    if (hasVariants && multiple) {
      const totalVariants = item.variants!.length;
      const selectedCount = item.variants!.filter((v) =>
        isSelected(v.id)
      ).length;
      parentChecked = totalVariants > 0 && totalVariants === selectedCount;
      parentIndeterminate = selectedCount > 0 && selectedCount < totalVariants;
    } else {
      parentChecked = itemIsSelected;
    }

    return (
      <div
        key={item.id}
        className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
          isChild ? "bg-gray-50/50" : ""
        }`}
      >
        <Group p="xs" wrap="nowrap" align="center">
          {isSelectable ? (
            <Checkbox
              checked={parentChecked}
              indeterminate={parentIndeterminate}
              onChange={() =>
                hasVariants
                  ? handleParentSelect(item)
                  : handleSingleSelect(item)
              }
              radius="sm"
              className="cursor-pointer"
            />
          ) : (
            <div className="w-5" />
          )}

          <Avatar
            src={item.image?.url}
            radius="md"
            size={isChild ? "sm" : "md"}
            className="bg-gray-100"
          >
            {item.name.charAt(0)}
          </Avatar>

          <div className="flex-1 min-w-0">
            <Text size="sm" fw={500} lineClamp={1}>
              {item.name}
            </Text>
            <Group gap="xs">
              {item.variants?.length === 0 && (
                <Text size="xs" c="dimmed">
                  SKU: {item.sku || "-"}
                </Text>
              )}

              {item.variants?.length === 0 && (
                <Text size="xs" c={item.stock > 0 ? "teal" : "red"}>
                  Stok: {item.stock}
                </Text>
              )}
            </Group>
          </div>

          {hasVariants && (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? (
                <IconChevronDown size={18} />
              ) : (
                <IconChevronRight size={18} />
              )}
            </ActionIcon>
          )}
        </Group>

        {hasVariants && (
          <Collapse in={isExpanded}>
            <div className="pl-6 pr-2 py-1 flex flex-col gap-1 border-l-2 border-gray-200 ml-4 mb-2">
              {item.variants?.map((variant) => renderRow(variant, true))}
            </div>
          </Collapse>
        )}
      </div>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Ürün Seçimi"
      size="lg"
      classNames={{
        header: "border-b border-gray-200",
        body: "p-0 flex flex-col h-[600px]",
      }}
      {...props}
    >
      <div className="p-3 border-b border-gray-200 bg-white">
        <TextInput
          defaultValue={search}
          placeholder="Ürün adı, SKU ile ara..."
          leftSection={<IconSearch size={16} />}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </div>

      <ScrollArea className="flex-1 bg-white">
        {isLoading ? (
          <GlobalLoader />
        ) : data?.data && data.data.length > 0 ? (
          <Stack gap={0}>{data.data.map((item) => renderRow(item))}</Stack>
        ) : (
          <div className="p-8 text-center text-gray-500">Ürün bulunamadı.</div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-gray-200 bg-gray-50 flex flex-col gap-3">
        {data?.pagination && (
          <div className="flex justify-center">
            <Pagination
              total={data.pagination.totalPages}
              value={page}
              onChange={setPage}
              size="sm"
            />
          </div>
        )}

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {localSelected.length} ürün seçildi
          </Text>
          <Group>
            <Button variant="default" onClick={onClose}>
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              leftSection={<IconCheck size={16} />}
              disabled={localSelected.length === 0}
            >
              Seçimi Tamamla
            </Button>
          </Group>
        </Group>
      </div>
    </Modal>
  );
};

export default SelectableProductModal;
