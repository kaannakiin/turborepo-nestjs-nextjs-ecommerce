"use client";

import { turkishSelectFilter } from "@lib/ui/product-helper";
import { ComboboxItem, Select, SelectProps } from "@mantine/core";
import { CountryType } from "@repo/database/client";
import { TURKEY_DB_ID } from "@repo/types";
import { useMemo } from "react";
import { useDistricts } from "../../../hooks/useLocations";

export interface DistrictSelectData {
  value: string;
  label: string;
}

interface DistrictInputProps {
  countryId: string;
  cityId: string;
  addressType: CountryType;
  selectProps?: Omit<SelectProps, "data">;
  onSelect?: (selectedData: DistrictSelectData | null) => void;
}

const DistrictInput = ({
  addressType,
  cityId,
  countryId,
  selectProps,
  onSelect,
}: DistrictInputProps) => {
  const isEnabled =
    !!countryId &&
    !!cityId &&
    countryId === TURKEY_DB_ID &&
    addressType === "CITY";

  const {
    data: districts,
    isLoading,
    isError,
  } = useDistricts({
    countryId,
    cityId,
    enabled: isEnabled,
  });

  const selectData = useMemo(() => {
    if (!districts) return [];
    return districts.map(
      (district): DistrictSelectData => ({
        value: district.id.toString(),
        label: district.name,
      })
    );
  }, [districts]);

  const isDisabled = isLoading || isError || !isEnabled;

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
          ? "Önce ülke seçin"
          : !cityId
            ? "Önce şehir seçin"
            : isLoading
              ? "Yükleniyor..."
              : "İlçe seçin"
      }
      searchable
      nothingFoundMessage="İlçe bulunamadı"
      maxDropdownHeight={300}
      filter={turkishSelectFilter}
      {...selectProps}
      onChange={handleChange}
    />
  );
};

export default DistrictInput;
