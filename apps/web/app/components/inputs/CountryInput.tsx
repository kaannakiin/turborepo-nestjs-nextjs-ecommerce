"use client";

import { ComboboxItem, Group, Select, SelectProps, Text } from "@mantine/core";
import { Locale } from "@repo/database/client";
import { GetAllCountryReturnType } from "@repo/types";
import { useMemo } from "react";
import { useCountries } from "../../../hooks/useLocations";

export interface CountrySelectData {
  value: string;
  label: string;
  emoji: string;
  name: string;
  country: GetAllCountryReturnType;
}

interface CountryInputProps {
  selectProps?: Omit<SelectProps, "data" | "onChange">;
  locale?: Locale;
  onChange?: (selectedData: CountrySelectData | null) => void;
  value?: string | null;
  onlyState?: boolean;
  onlyCity?: boolean;
}

const CountryInput = ({
  selectProps,
  locale = "TR",
  onChange,
  value,
  onlyState,
  onlyCity,
}: CountryInputProps) => {
  const { data: countries, isLoading, isError } = useCountries();

  const selectData = useMemo(() => {
    if (!countries) return [];

    return countries
      .filter((country) => {
        if (onlyState && country.type !== "STATE") return false;
        if (onlyCity && country.type !== "CITY") return false;
        return true;
      })
      .map((country): CountrySelectData => {
        const translation = country.translations.find(
          (t) => t.locale === locale
        );
        const name = translation?.name ?? country.translations[0]?.name ?? "";

        return {
          value: country.id.toString(),
          label: `${country.emoji} ${name}`,
          emoji: country.emoji,
          name: name,
          country: country,
        };
      });
  }, [countries, locale, onlyState, onlyCity]);
  const handleChange = (val: string | null) => {
    const selectedItem = val
      ? (selectData.find((d) => d.value === val) ?? null)
      : null;
    onChange?.(selectedItem);
  };

  return (
    <Select
      data={selectData}
      value={value}
      onChange={handleChange}
      disabled={isLoading || isError}
      searchable
      nothingFoundMessage="Ülke bulunamadı"
      maxDropdownHeight={300}
      renderOption={({ option }) => {
        const item = selectData.find((d) => d.value === option.value);
        return (
          <Group gap="xs" wrap="nowrap">
            <Text size="lg">{item?.emoji}</Text>
            <Text size="sm">{item?.name}</Text>
          </Group>
        );
      }}
      filter={({ options, search }) => {
        const searchLower = search.toLowerCase().trim();
        return options.filter((option): option is ComboboxItem => {
          if (!("value" in option)) return false;
          const item = selectData.find((d) => d.value === option.value);
          return item?.name.toLowerCase().includes(searchLower) ?? false;
        });
      }}
      {...selectProps}
    />
  );
};

export default CountryInput;
