"use client";

import {
  Accordion,
  Box,
  Checkbox,
  Drawer,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { InfinityScrollPageReturnType } from "@repo/types";

interface QueryFiltersProps {
  filters: InfinityScrollPageReturnType["filters"];
  opened: boolean;
  onClose: () => void;
  isMobileDrawer?: boolean;
}

const FilterContent = ({
  filters,
}: {
  filters: InfinityScrollPageReturnType["filters"];
}) => {
  return (
    <Accordion
      multiple
      defaultValue={["brands", "categories"]}
      variant="separated"
    >
      {filters.categories.length > 0 && (
        <Accordion.Item value="categories">
          <Accordion.Control>Kategoriler</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {filters.categories.map((category) => (
                <Checkbox
                  key={category.id}
                  label={category.translations[0]?.name}
                />
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      )}

      {filters.brands.length > 0 && (
        <Accordion.Item value="brands">
          <Accordion.Control>Markalar</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {filters.brands.map((brand) => (
                <Checkbox key={brand.id} label={brand.translations[0]?.name} />
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      )}

      {filters.tags.length > 0 && (
        <Accordion.Item value="tags">
          <Accordion.Control>Etiketler</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {filters.tags.map((tag) => (
                <Checkbox key={tag.id} label={tag.translations[0]?.name} />
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      )}

      {filters.variantGroups.map((group) => (
        <Accordion.Item key={group.id} value={group.id}>
          <Accordion.Control>{group.translations[0]?.name}</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {group.options.map((option) => (
                <Checkbox
                  key={option.id}
                  label={option.translations[0]?.name}
                />
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

const QueryFilters = ({
  filters,
  opened,
  onClose,
  isMobileDrawer = false,
}: QueryFiltersProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Mobile Drawer
  if (isMobileDrawer && isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="85%"
        title="Filtreler"
        overlayProps={{ backgroundOpacity: 0.5, blur: 2 }}
        transitionProps={{
          transition: "slide-up",
          duration: 300,
        }}
        styles={{
          content: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
          title: {
            fontWeight: 600,
            fontSize: 18,
          },
        }}
      >
        <ScrollArea h="calc(85vh - 80px)" offsetScrollbars>
          <FilterContent filters={filters} />
        </ScrollArea>
      </Drawer>
    );
  }

  // Mobile ama drawer değilse (duplicate önlemek için)
  if (isMobileDrawer && !isMobile) {
    return null;
  }

  // Desktop Sidebar
  if (!isMobileDrawer && !isMobile) {
    return (
      <Box pos="sticky" top={80}>
        <ScrollArea h="calc(100vh - 120px)" offsetScrollbars>
          <FilterContent filters={filters} />
        </ScrollArea>
      </Box>
    );
  }

  return null;
};

export default QueryFilters;
