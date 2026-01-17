'use client';

import { getSortProductPageLabel } from '@lib/helpers';
import { Drawer, Stack, Text, UnstyledButton } from '@mantine/core';
import { ProductPageSortOption } from '@repo/types';
import { IconCheck } from '@tabler/icons-react';

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
        {Object.values(ProductPageSortOption).map((option) => {
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
                    ? 'font-semibold text-[var(--mantine-primary-color-7)]'
                    : 'font-normal text-gray-900'
                }`}
              >
                {getSortProductPageLabel(option)}
              </span>

              {isSelected && (
                <IconCheck
                  size={20}
                  className="text-[var(--mantine-primary-color-7)] flex-shrink-0"
                />
              )}
            </UnstyledButton>
          );
        })}
      </div>
    </Drawer>
  );
};

export default SortDrawer;
