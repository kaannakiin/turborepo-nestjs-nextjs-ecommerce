"use client";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  Loader,
  MultiSelect,
  MultiSelectProps,
  Select,
  SelectProps,
} from "@mantine/core";
import { useQuery } from "@repo/shared";
import { CategoryIdAndName } from "@repo/types";
import { useState } from "react";

const fetchCategories = async () => {
  const response = await fetchWrapper.get<CategoryIdAndName[]>(
    "/admin/products/categories/get-all-categories-only-id-and-name"
  );
  if (!response.success) {
    throw new Error("Kategoriler alınamadı");
  }
  return response.data;
};

export interface SelectOption {
  value: string;
  label: string;
}

interface AdminCategoryDataSelectProps {
  multiple?: boolean;
  onChange: (value: string | string[] | null, options?: SelectOption[]) => void;
  props?: Partial<MultiSelectProps | SelectProps>;
  value?: string | string[] | null;
}

const AdminCategoryDataSelect = ({
  multiple = false,
  onChange,
  value,
  props = {},
}: AdminCategoryDataSelectProps) => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : !!value;

  const { data, isLoading, isError, isFetched } = useQuery({
    queryKey: ["data-select-categories"],
    queryFn: fetchCategories,
    enabled: isDropdownOpened || hasValue,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const handleOpen = () => {
    if (!isDropdownOpened) {
      setIsDropdownOpened(true);
    }
  };

  const isEmpty = isFetched && Array.isArray(data) && data.length === 0;

  let dynamicPlaceholder = "Kategori seçiniz";
  if (isError) dynamicPlaceholder = "⚠️ Veri alınamadı";
  else if (isLoading && hasValue) dynamicPlaceholder = "Seçim yükleniyor...";
  else if (isLoading) dynamicPlaceholder = "Yükleniyor...";
  else if (isEmpty) dynamicPlaceholder = "Tanımlı kategori bulunmuyor";

  const isComponentDisabled = isError || (isEmpty && !isLoading);
  const isReady = !isLoading && !isError && data && data.length > 0;
  const safeValue = isReady ? value : multiple ? [] : null;

  const selectData: SelectOption[] =
    data?.map((category: CategoryIdAndName) => ({
      value: String(category.id),
      label: category.name,
    })) || [];

  const logicProps = {
    data: selectData,
    onDropdownOpen: handleOpen,
    nothingFoundMessage: isLoading ? "Yükleniyor..." : "Kategori bulunamadı",
    rightSection: isLoading ? <Loader size={18} /> : null,
    disabled: isComponentDisabled,
    searchable: true,
  };

  const defaultStyles = {
    label: "Kategori Seçiniz",
    placeholder: dynamicPlaceholder,
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
            val.includes(opt.value)
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

export default AdminCategoryDataSelect;
