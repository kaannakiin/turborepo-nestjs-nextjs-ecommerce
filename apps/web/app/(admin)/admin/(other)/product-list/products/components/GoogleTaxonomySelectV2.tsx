import GlobalLoader from '@/components/GlobalLoader';
import { useGetGoogleTaxonomyCategories } from '@hooks/admin/useProducts';
import {
  Accordion,
  Checkbox,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { TaxonomyCategoryWithChildren } from '@repo/types';
import { IconSearch, IconSelector, IconTag } from '@tabler/icons-react';
import { useState } from 'react';

interface GoogleTaxonomySelectV2Props {
  value?: string;
  onChange?: (value: string | null) => void;
  error?: string;
}

const GoogleTaxonomySelectV2 = ({
  error,
  onChange,
  value,
}: GoogleTaxonomySelectV2Props) => {
  const [opened, { open, close }] = useDisclosure();
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 200);

  const { data, isLoading, isPending } = useGetGoogleTaxonomyCategories();

  const findCategoryById = (
    categories: TaxonomyCategoryWithChildren[],
    targetId: string,
  ): TaxonomyCategoryWithChildren | null => {
    for (const category of categories) {
      if (category.id === targetId) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryById(category.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const getSelectedCategoryName = (): string => {
    if (!value || !data || data.length === 0) {
      return 'Google Kategorisi Seç';
    }

    const selectedCategory = findCategoryById(data, value);
    return selectedCategory?.originalName || 'Google Kategorisi Seç';
  };

  const filterCategoriesRecursive = (
    categories: TaxonomyCategoryWithChildren[],
    searchTerm: string,
  ): TaxonomyCategoryWithChildren[] => {
    if (searchTerm.trim() === '') return categories;

    return categories.reduce(
      (filtered: TaxonomyCategoryWithChildren[], category) => {
        const matchesSearch = category.originalName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        let filteredChildren: TaxonomyCategoryWithChildren[] = [];
        if (category.children && category.children.length > 0) {
          filteredChildren = filterCategoriesRecursive(
            category.children,
            searchTerm,
          );
        }

        if (matchesSearch || filteredChildren.length > 0) {
          filtered.push({
            ...category,
            children: filteredChildren,
          });
        }

        return filtered;
      },
      [],
    );
  };

  const renderCategory = (
    category: TaxonomyCategoryWithChildren,
    level: number = 0,
  ) => {
    const hasChildren = category.children && category.children.length > 0;

    if (hasChildren) {
      return (
        <Accordion.Item key={category.id} value={category.id}>
          <Accordion.Control tt={'capitalize'}>
            <Group gap={'xs'} align="center">
              <div className="w-1 h-6 bg-black rounded-sm"></div>
              <Checkbox
                color={'black'}
                readOnly
                checked={value === category.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onChange) {
                    onChange(category.id);
                  }
                }}
              />
              <Text tt="capitalize" fz={'md'} fw={level === 0 ? 700 : 500}>
                {category.originalName}
              </Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {level < 2 ? (
              <Accordion multiple={false} chevronIconSize={24}>
                {category.children?.map((child) =>
                  renderCategory(child, level + 1),
                )}
              </Accordion>
            ) : (
              <Stack gap="xs">
                {category.children?.map((child) =>
                  renderCategory(child, level + 1),
                )}
              </Stack>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      );
    } else {
      return (
        <div key={category.id} className={`pl-${level * 4}`}>
          <Group
            gap={'xs'}
            align="center"
            py="xs"
            className="cursor-pointer"
            onClick={() => onChange && onChange(category.id)}
          >
            <div className="w-1 h-6 bg-gray-300 rounded-sm"></div>
            <Checkbox
              color={'black'}
              readOnly
              checked={value === category.id}
            />
            <Text tt="capitalize" fz={'md'}>
              {category.originalName}
            </Text>
          </Group>
        </div>
      );
    }
  };
  interface CardStyleSelectorProps {
    getSelectedCategoryName: () => string;
    open: () => void;
    error?: string;
  }

  const CardStyleSelector = ({
    getSelectedCategoryName: cardGet,
    open,
    error,
  }: CardStyleSelectorProps) => {
    const hasSelection = cardGet() !== 'Google Kategorisi Seç';

    return (
      <Paper
        withBorder
        p="md"
        className={`
        cursor-pointer transition-all duration-200 hover:shadow-md
        ${error ? 'border-red-300' : 'border-gray-200 hover:border-[var(--mantine-admin-3)]'}
        ${hasSelection ? 'bg-[var(--mantine-admin-5)] border-[var(--mantine-admin-2)]' : 'bg-gray-50'}
      `}
        onClick={open}
      >
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <ThemeIcon
              variant={hasSelection ? 'filled' : 'light'}
              color={hasSelection ? 'blue' : 'gray'}
              size="lg"
            >
              <IconTag size={20} />
            </ThemeIcon>
            <div>
              <Text
                size="xs"
                c="dimmed"
                fw={500}
                className="uppercase tracking-wide"
              >
                Google Kategorisi
              </Text>
              <Text
                size="sm"
                fw={hasSelection ? 600 : 400}
                c={hasSelection ? 'blue' : 'dimmed'}
                className="truncate max-w-[250px]"
              >
                {hasSelection ? getSelectedCategoryName() : 'Kategori seçin'}
              </Text>
            </div>
          </Group>
          <IconSelector size={18} className="text-gray-400" />
        </Group>
      </Paper>
    );
  };

  const filteredCategories = data
    ? filterCategoriesRecursive(data, debounced)
    : [];

  return (
    <>
      <CardStyleSelector
        getSelectedCategoryName={getSelectedCategoryName}
        open={open}
        error={error}
      />
      <Modal
        opened={opened}
        onClose={close}
        title="Google Kategorisi Ekle"
        size={'lg'}
        classNames={{
          header: 'border-b border-gray-700',
          body: 'py-2 flex flex-col gap-4',
        }}
      >
        {isLoading || isPending ? (
          <GlobalLoader />
        ) : (
          <>
            <TextInput
              placeholder="Google Kategorisi Ara"
              variant="filled"
              className="mt-auto"
              rightSection={<IconSearch />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
              }}
            />
            {data && data.length > 0 ? (
              <ScrollArea h={600} scrollbarSize={6}>
                <Stack gap={'lg'}>
                  <Accordion chevronIconSize={24} multiple={false}>
                    {filteredCategories.map((category) =>
                      renderCategory(category),
                    )}
                  </Accordion>
                </Stack>
              </ScrollArea>
            ) : (
              <div>Kategori bulunamadı</div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default GoogleTaxonomySelectV2;
