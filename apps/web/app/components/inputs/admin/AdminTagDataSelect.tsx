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
import { useState } from "react";

type ProductTagIdAndName = {
  id: string;
  name: string;
};

const fetchTags = async () => {
  const response = await fetchWrapper.get<ProductTagIdAndName[]>(
    "/admin/products/tags/get-all-tags-id-and-name"
  );
  if (!response.success) {
    throw new Error("Etiketler alınamadı");
  }
  return response.data;
};

export interface SelectOption {
  value: string;
  label: string;
}

interface AdminTagDataSelectProps {
  multiple?: boolean;
  onChange: (value: string | string[] | null, options?: SelectOption[]) => void;
  value?: string | string[] | null;
  props?: Partial<MultiSelectProps | SelectProps>;
}

const AdminTagDataSelect = ({
  multiple = false,
  onChange,
  value,
  props = {},
}: AdminTagDataSelectProps) => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : !!value;

  const { data, isLoading, isError, isFetched } = useQuery<
    ProductTagIdAndName[]
  >({
    queryKey: ["data-select-tags"],
    queryFn: fetchTags,
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

  let dynamicPlaceholder = "Etiket seçiniz";
  if (isError) dynamicPlaceholder = "⚠️ Veri alınamadı";
  else if (isLoading && hasValue) dynamicPlaceholder = "Seçim yükleniyor...";
  else if (isLoading) dynamicPlaceholder = "Yükleniyor...";
  else if (isEmpty) dynamicPlaceholder = "Tanımlı etiket bulunmuyor";

  const isComponentDisabled = isError || (isEmpty && !isLoading);
  const isReady = !isLoading && !isError && data && data.length > 0;
  const safeValue = isReady ? value : multiple ? [] : null;

  const selectData: SelectOption[] =
    data?.map((item) => ({
      value: String(item.id),
      label: item.name,
    })) || null;

  const logicProps = {
    data: selectData,
    onDropdownOpen: handleOpen,
    nothingFoundMessage: isLoading ? "Yükleniyor..." : "Sonuç bulunamadı",
    rightSection: isLoading ? <Loader size={18} /> : null,
    disabled: isComponentDisabled,
    searchable: true,
  };

  const defaultStyles = {
    placeholder: dynamicPlaceholder,
    label: "Etiket Seçiniz",
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

export default AdminTagDataSelect;
