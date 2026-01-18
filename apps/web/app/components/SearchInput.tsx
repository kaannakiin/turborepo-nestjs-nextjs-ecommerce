'use client';

import {
  Group,
  Select,
  SelectProps as MantineSelectProps,
  TextInput,
  TextInputProps,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { SEARCH_PARAM_KEY, SELECT_PARAM_KEY } from '@repo/types';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type SelectProps = MantineSelectProps & {
  selectkey?: string;
};

interface SearchInputProps extends TextInputProps {
  searchKey?: string;
  isSortActive?: boolean;
  selectProps?: SelectProps;
}

const SearchInput = ({
  searchKey = SEARCH_PARAM_KEY,
  isSortActive = false,
  selectProps,
  ...props
}: SearchInputProps) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const [search, setSearch] = useState<string | undefined>(
    (searchParams.get(searchKey) as string) || '',
  );

  const [selectValue, setSelectValue] = useState<string | null>(
    searchParams.get(selectProps?.selectkey || SELECT_PARAM_KEY) || null,
  );

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    replace(`?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((query: string) => {
    updateUrl({ [searchKey]: query });
  }, 500);

  const handleSelectChange = (value: string | null) => {
    setSelectValue(value);
    updateUrl({ [selectProps?.selectkey || 'sort']: value });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
    handleSearch(event.currentTarget.value);
  };

  return (
    <Group align="center" gap="md">
      {isSortActive && selectProps && (
        <Select
          {...selectProps}
          value={selectValue}
          onChange={handleSelectChange}
        />
      )}
      <TextInput
        {...props}
        value={search}
        onChange={handleSearchChange}
        rightSection={
          search ? (
            <IconX
              onClick={() => {
                updateUrl({ [searchKey]: null });
                setSearch('');
              }}
            />
          ) : (
            props.rightSection || (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSearch size={16} />
              </div>
            )
          )
        }
      />
    </Group>
  );
};

export default SearchInput;
