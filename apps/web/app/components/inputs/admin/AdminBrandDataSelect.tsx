'use client';
import {
  Loader,
  MultiSelect,
  MultiSelectProps,
  Select,
  SelectProps,
} from '@mantine/core';
import { BrandIdAndName } from '@repo/types';
import { useState } from 'react';
import { useAllBrandsSimple } from '@hooks/admin/useAdminBrands';

export interface SelectOption {
  value: string;
  label: string;
}

interface AdminBrandDataSelectProps {
  multiple?: boolean;
  onChange: (value: string | string[] | null, options?: SelectOption[]) => void;
  props?: Partial<MultiSelectProps | SelectProps>;
  value?: string | string[] | null;
}

const AdminBrandDataSelect = ({
  multiple = false,
  onChange,
  value,
  props = {},
}: AdminBrandDataSelectProps) => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : !!value;

  const { data, isLoading, isError, isFetched } = useAllBrandsSimple(
    isDropdownOpened || hasValue,
  );

  const handleOpen = () => {
    if (!isDropdownOpened) {
      setIsDropdownOpened(true);
    }
  };

  const isEmpty = isFetched && Array.isArray(data) && data.length === 0;

  let dynamicPlaceholder = 'Marka seçiniz';
  if (isError) dynamicPlaceholder = '⚠️ Veri alınamadı';
  else if (isLoading && hasValue) dynamicPlaceholder = 'Seçim yükleniyor...';
  else if (isLoading) dynamicPlaceholder = 'Yükleniyor...';
  else if (isEmpty) dynamicPlaceholder = 'Tanımlı marka bulunmuyor';

  const isComponentDisabled = isError || (isEmpty && !isLoading);
  const isReady = !isLoading && !isError && data && data.length > 0;
  const safeValue = isReady ? value : multiple ? [] : null;

  const selectData: SelectOption[] =
    data?.map((brand: BrandIdAndName) => ({
      value: String(brand.id),
      label: brand.name,
    })) || [];

  const logicProps = {
    data: selectData,
    onDropdownOpen: handleOpen,
    nothingFoundMessage: isLoading ? 'Yükleniyor...' : 'Marka bulunamadı',
    rightSection: isLoading ? <Loader size={18} /> : null,
    disabled: isComponentDisabled,
    searchable: true,
  };

  const defaultStyles = {
    placeholder: dynamicPlaceholder,
    label: 'Marka Seçiniz',
  };

  if (multiple) {
    return (
      <MultiSelect
        {...defaultStyles}
        {...(props as MultiSelectProps)}
        {...logicProps}
        value={safeValue as string[]}
        onChange={(val) => {
          const selectedOptions = selectData.filter((opt) =>
            val.includes(opt.value),
          );
          onChange(val, selectedOptions);
        }}
      />
    );
  }

  return (
    <Select
      {...defaultStyles}
      {...(props as SelectProps)}
      {...logicProps}
      value={safeValue as string | null}
      onChange={(val) => {
        const selectedOption = selectData.find((opt) => opt.value === val);
        onChange(val, selectedOption ? [selectedOption] : []);
      }}
    />
  );
};

export default AdminBrandDataSelect;
