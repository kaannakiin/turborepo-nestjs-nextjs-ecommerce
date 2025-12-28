"use client";

import { Drawer, Stack, Text, UnstyledButton, Group } from "@mantine/core";
import {
  getSortProductPageLabel,
  ProductPageSortOption,
  SORT_OPTIONS_ARRAY,
} from "@repo/shared";
import { IconCheck } from "@tabler/icons-react";

interface SortDrawerProps {
  opened: boolean;
  onClose: () => void;
  currentSort: ProductPageSortOption;
  onApply: (sortValue: ProductPageSortOption) => void;
}

const SortDrawer = ({
  opened,
  onClose,
  currentSort,
  onApply,
}: SortDrawerProps) => {
  const handleSelect = (option: ProductPageSortOption) => {
    onApply(option);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="md"
      title={
        <Stack gap={4}>
          <Text fw={600} size="lg">
            Sıralama
          </Text>
        </Stack>
      }
    >
      <div className="flex flex-col gap-1 pb-4">
        {SORT_OPTIONS_ARRAY.map((option) => {
          const isSelected = currentSort === option;

          return (
            <UnstyledButton
              key={option}
              onClick={() => handleSelect(option)}
              className="flex items-center cursor-pointer justify-between p-3 rounded-lg transition-colors hover:bg-gray-100 active:bg-gray-200"
            >
              <span
                className={`text-base transition-all ${
                  isSelected
                    ? "font-semibold underline text-blue-600"
                    : "font-normal text-gray-900"
                }`}
              >
                {getSortProductPageLabel(option)}
              </span>

              {isSelected && (
                <IconCheck size={20} className="text-blue-600 flex-shrink-0" />
              )}
            </UnstyledButton>
          );
        })}
      </div>
    </Drawer>
  );
};

export default SortDrawer;
