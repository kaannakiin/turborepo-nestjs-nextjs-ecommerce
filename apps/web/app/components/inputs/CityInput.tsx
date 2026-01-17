'use client';

import { turkishSelectFilter } from '@lib/product-helper';
import { ComboboxItem, Select, SelectProps } from '@mantine/core';
import { CountryType } from '@repo/database/client';
import { GetAllCityReturnType } from '@repo/types';
import { useMemo } from 'react';
import { useCities } from '../../../hooks/useLocations';

export interface CitySelectData {
  value: string;
  label: string;
  city: GetAllCityReturnType;
}

interface CityInputProps {
  countryId: string;
  addressType: CountryType;
  selectProps?: Omit<SelectProps, 'data'>;
  onSelect?: (selectedData: CitySelectData | null) => void;
}

const CityInput = ({
  countryId,
  addressType,
  selectProps,
  onSelect,
}: CityInputProps) => {
  const {
    data: cities,
    isLoading,
    isError,
  } = useCities({
    countryId,
    addressType,
  });

  const selectData = useMemo(() => {
    if (!cities) return [];
    return cities.map(
      (city): CitySelectData => ({
        value: city.id.toString(),
        label: city.name,
        city: city,
      }),
    );
  }, [cities]);

  const isDisabled =
    isLoading || isError || !countryId || addressType !== 'CITY';

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
            : 'Şehir seçin'
      }
      searchable
      nothingFoundMessage="Şehir bulunamadı"
      maxDropdownHeight={300}
      filter={turkishSelectFilter}
      {...selectProps}
      onChange={handleChange}
    />
  );
};

export default CityInput;
