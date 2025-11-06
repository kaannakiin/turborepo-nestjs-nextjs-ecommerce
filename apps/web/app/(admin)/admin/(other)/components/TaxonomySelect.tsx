import fetchWrapper, { ApiError } from "@lib/fetchWrapper";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Input,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure, useDebouncedCallback } from "@mantine/hooks";
import { ControllerRenderProps, useQuery } from "@repo/shared";
import { NewTaxonomyCategory } from "@repo/types";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";

interface SimplifiedTaxonomyCategory {
  id: string;
  name: string;
  hasChildren: boolean;
}
interface OnSelectProp {
  onSelect: (category: SimplifiedTaxonomyCategory) => void;
}

interface CategoryListProps extends OnSelectProp {
  parentId: string | null;
  preExpandedIds: string[];
  selectedId: string | null;
}
interface CategoryItemProps extends OnSelectProp {
  category: SimplifiedTaxonomyCategory;
  preExpandedIds: string[];
  selectedId: string | null;
}

const fetchCategoriesByParent = async (
  parentId: string | null
): Promise<SimplifiedTaxonomyCategory[]> => {
  const url = parentId
    ? `/admin/products/google-categories/get-categories-by-parent-id?parentId=${parentId}`
    : `/admin/products/google-categories/get-categories-by-depth?depth=0`;
  const response = await fetchWrapper.get<NewTaxonomyCategory>(url);
  if (!response.success) {
    const errorMessage = response as ApiError;
    throw new Error(
      errorMessage.error || "Failed to fetch Google Taxonomy categories"
    );
  }
  if (!response.data.success || !response.data.categories) {
    throw new Error("Failed to fetch Google Taxonomy categories");
  }
  const simplifiedData = response.data.categories.map((category) => ({
    id: category.id,
    name: category.originalName,
    hasChildren: category._count.children > 0,
    parentId: null,
  }));
  return simplifiedData;
};

const fetchCategoryBySearch = async (
  searchTerm: string
): Promise<SimplifiedTaxonomyCategory[]> => {
  const response = await fetchWrapper.get<NewTaxonomyCategory>(
    `/admin/products/google-categories/search-categories?search=${encodeURIComponent(searchTerm)}`
  );

  if (!response.success) {
    const errorMessage = response as ApiError;
    throw new Error(
      errorMessage.error || "Failed to search Google Taxonomy categories"
    );
  }
  if (!response.data.success || !response.data.categories) {
    throw new Error("Failed to search Google Taxonomy categories");
  }

  const simplifiedData = response.data.categories.map((category) => ({
    id: category.id,
    name: category.originalName,
    hasChildren: category._count.children > 0,
    parentId: null,
  }));

  return simplifiedData;
};

const fetchAncestorIds = async (id: string): Promise<string[]> => {
  if (!id) return [];
  const response = await fetchWrapper.get<{ success: boolean; ids: string[] }>(
    `/admin/products/google-categories/get-ancestor-ids-by-id?id=${id}`
  );
  if (!response.success || !response.data.ids) {
    throw new Error("Failed to fetch ancestor IDs");
  }
  return response.data.ids;
};

const fetchCategoryDetails = async (
  id: string
): Promise<SimplifiedTaxonomyCategory> => {
  if (!id) throw new Error("ID required");
  const response = await fetchWrapper.get<{
    success: boolean;
    category: SimplifiedTaxonomyCategory;
  }>(`/admin/products/google-categories/get-category-details-by-id?id=${id}`);
  if (!response.success || !response.data.category) {
    throw new Error("Failed to fetch category details");
  }
  return response.data.category;
};

function CategoryItem({
  category,
  onSelect,
  preExpandedIds,
  selectedId,
}: CategoryItemProps) {
  const isPreExpanded = preExpandedIds.includes(category.id);
  const isSelected = selectedId === category.id;
  const [isOpen, { toggle }] = useDisclosure(
    isPreExpanded && category.hasChildren
  );
  const categoryName = category.name;

  const handleClick = () => {
    if (category.hasChildren) {
      toggle();
    } else {
      onSelect(category);
    }
  };

  return (
    <Box>
      <Paper
        p="xs"
        radius="md"
        withBorder
        style={(theme) => ({
          cursor: "pointer",
          transition: "all 0.2s ease",

          backgroundColor: isSelected ? theme.colors.admin[0] : "transparent",
          borderColor: isSelected
            ? theme.colors.admin[5]
            : "var(--mantine-color-gray-3)",
        })}
        onMouseEnter={(e) => {
          if (isSelected) return;
          e.currentTarget.style.borderColor = "var(--mantine-primary-color-5)";
          e.currentTarget.style.backgroundColor =
            "var(--mantine-primary-color-0)";
        }}
        onMouseLeave={(e) => {
          if (isSelected) return;
          e.currentTarget.style.borderColor = "var(--mantine-color-gray-3)";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        onClick={handleClick}
      >
        <Group gap="xs" wrap="nowrap">
          {category.hasChildren ? (
            <ActionIcon
              variant="subtle"
              color="admin"
              size="sm"
              style={{ transition: "transform 0.2s ease" }}
            >
              {isOpen ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )}
            </ActionIcon>
          ) : (
            <Box w={28} />
          )}
          <Text
            size="sm"
            fw={isSelected ? 700 : 500}
            c={isSelected ? "admin.7" : undefined}
          >
            {categoryName}
          </Text>
        </Group>
      </Paper>

      {isOpen && category.hasChildren && (
        <Box
          pl="xl"
          pt="xs"
          style={{
            borderLeft: "2px solid var(--mantine-primary-color-2)",
            marginLeft: "14px",
          }}
        >
          {/* YENİ: Prop'lar aşağıya aktarıldı */}
          <CategoryList
            parentId={category.id}
            onSelect={onSelect}
            preExpandedIds={preExpandedIds}
            selectedId={selectedId}
          />
        </Box>
      )}
    </Box>
  );
}

function CategoryList({
  parentId,
  onSelect,
  preExpandedIds,
  selectedId,
}: CategoryListProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["google-taxonomy", parentId ?? "root"],
    queryFn: () => fetchCategoriesByParent(parentId),
  });
  if (isLoading) {
    return (
      <Paper p="md" radius="md" withBorder bg="admin.0">
        <Group gap="xs">
          <Loader size="xs" color="admin" />
          <Text size="sm" c="admin.7">
            Kategoriler yükleniyor...
          </Text>
        </Group>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper p="md" radius="md" withBorder bg="red.0">
        <Text c="red.7" size="sm" fw={500}>
          Kategoriler yüklenemedi.
        </Text>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    if (parentId !== null) {
      return (
        <Paper p="sm" radius="md" withBorder bg="gray.0">
          <Text c="dimmed" size="sm">
            Alt kategori bulunamadı.
          </Text>
        </Paper>
      );
    }
    return null;
  }

  return (
    <Stack gap="xs">
      {data.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onSelect={onSelect}
          preExpandedIds={preExpandedIds}
          selectedId={selectedId}
        />
      ))}
    </Stack>
  );
}

interface TaxonomySelectProps {
  field: ControllerRenderProps;
}
const TaxonomySelect = ({ field }: TaxonomySelectProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const debounced = useDebouncedCallback(setDebouncedSearchTerm, 500);
  const { data: selectedCategoryDetails, isLoading: isLoadingDetails } =
    useQuery({
      queryKey: ["google-taxonomy-details", field.value],
      queryFn: () => fetchCategoryDetails(field.value),
      enabled: !!field.value,
      staleTime: Infinity,
    });

  /**
   * YENİ: Modal açıldığında ata yolunu getirmek için query
   */
  const { data: ancestorIds, isLoading: isLoadingAncestors } = useQuery({
    queryKey: ["google-taxonomy-ancestors", field.value],
    queryFn: () => fetchAncestorIds(field.value),
    enabled: opened && !!field.value,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useQuery({
    queryKey: ["google-taxonomy-search", debouncedSearchTerm],
    queryFn: () => fetchCategoryBySearch(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
  });

  const handleSelect = (category: SimplifiedTaxonomyCategory) => {
    field.onChange(category.id);
    close();
  };
  const renderContent = () => {
    if (debouncedSearchTerm) {
      if (isSearchLoading) {
        return (
          <Group justify="center" p="md">
            <Loader size="sm" />
            <Text size="sm">Aranıyor...</Text>
          </Group>
        );
      }
      if (isSearchError) {
        return (
          <Paper p="md" radius="md" withBorder bg="red.0">
            <Text c="red.7" size="sm" fw={500}>
              Arama yapılamadı.
            </Text>
          </Paper>
        );
      }
      if (!searchData || searchData.length === 0) {
        return (
          <Paper p="sm" radius="md" withBorder bg="gray.0">
            <Text c="dimmed" size="sm">
              Sonuç bulunamadı.
            </Text>
          </Paper>
        );
      }

      return (
        <Stack gap="xs">
          {searchData.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              onSelect={handleSelect}
              preExpandedIds={ancestorIds ?? []}
              selectedId={field.value}
            />
          ))}
        </Stack>
      );
    }
    if (isLoadingAncestors) {
      return (
        <Paper p="md" radius="md" withBorder bg="admin.0">
          <Group gap="xs">
            <Loader size="xs" color="admin" />
            <Text size="sm" c="admin.7">
              Kategori yolu yükleniyor...
            </Text>
          </Group>
        </Paper>
      );
    }
    return (
      <CategoryList
        parentId={null}
        onSelect={handleSelect}
        preExpandedIds={ancestorIds ?? []}
        selectedId={field.value}
      />
    );
  };

  return (
    <>
      <Input.Wrapper label="Google Kategorisi" error={null}>
        <Input
          component="button"
          pointer
          onClick={open}
          styles={{
            input: {
              cursor: "pointer",
              textAlign: "left",
            },
          }}
          rightSection={
            isLoadingDetails ? <Loader size="xs" /> : <IconChevronDown />
          }
        >
          <Text size="sm" c={selectedCategoryDetails?.name ? "dark" : "dimmed"}>
            {selectedCategoryDetails?.name || "Kategori seçiniz"}
          </Text>
        </Input>
      </Input.Wrapper>
      <Modal
        opened={opened}
        onClose={close}
        title="Google Kategorisi Seçin"
        size="lg"
      >
        <TextInput
          placeholder="Kategori ara..."
          value={searchTerm}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setSearchTerm(value);
            debounced(value);
          }}
          mb="md"
        />
        <ScrollArea h={400} px="md">
          {renderContent()}
        </ScrollArea>
      </Modal>
    </>
  );
};

export default TaxonomySelect;
