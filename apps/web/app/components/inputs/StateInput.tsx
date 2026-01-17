'use client';

import { turkishSelectFilter } from '@lib/product-helper';
import { ComboboxItem, Select, SelectProps } from '@mantine/core';
import { CountryType } from '@repo/database/client';
import { GetAllStateReturnType } from '@repo/types';
import { useMemo } from 'react';
import { useStates } from '../../../hooks/useLocations';

export interface StateSelectData {
  value: string;
  label: string;
  state: GetAllStateReturnType;
}

interface StateInputProps {
  countryId: string;
  addressType: CountryType;
  selectProps?: Omit<SelectProps, 'data'>;
  onSelect?: (selectedData: StateSelectData | null) => void;
}

const StateInput = ({
  countryId,
  addressType,
  selectProps,
  onSelect,
}: StateInputProps) => {
  const {
    data: states,
    isLoading,
    isError,
  } = useStates({
    countryId,
    addressType,
  });

  const selectData = useMemo(() => {
    if (!states) return [];
    return states.map(
      (state): StateSelectData => ({
        value: state.id.toString(),
        label: state.name,
        state: state,
      }),
    );
  }, [states]);

  const isDisabled =
    isLoading || isError || !countryId || addressType !== 'STATE';

  const handleChange = (val: string | null, option: ComboboxItem | null) => {
    const selectedItem = val
      ? (selectData.find((d) => d.value === val) ?? null)
      : null;
    onSelect?.(selectedItem);

    if (selectProps?.onChange) {
      selectProps.onChange(val, option);
    }
  };

  return (
    <Select
      data={selectData}
      disabled={isDisabled}
      placeholder={
        !countryId
          ? 'Önce ülke seçin'
          : isLoading
            ? 'Yükleniyor...'
            : 'Şehir/Eyalet seçin'
      }
      searchable
      nothingFoundMessage="Sonuç bulunamadı"
      maxDropdownHeight={300}
      filter={turkishSelectFilter}
      {...selectProps}
      onChange={handleChange}
    />
  );
};

export default StateInput;
