"use client";

import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  MultiSelect,
  Select,
  Loader,
  MultiSelectProps,
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

interface AdminTagDataSelectProps {
  multiple?: boolean;
  onChange?: (
    value: ProductTagIdAndName | ProductTagIdAndName[] | null
  ) => void;

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

  const selectData =
    data?.map((item) => ({
      value: String(item.id),
      label: item.name,
    })) || [];

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
        onChange={(values) => {
          const selectedObjects =
            data?.filter((item) => values.includes(String(item.id))) || [];
          onChange?.(selectedObjects);
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
      onChange={(value) => {
        const selectedObject =
          data?.find((item) => String(item.id) === value) || null;
        onChange?.(selectedObject);
      }}
    />
  );
};

export default AdminTagDataSelect;
