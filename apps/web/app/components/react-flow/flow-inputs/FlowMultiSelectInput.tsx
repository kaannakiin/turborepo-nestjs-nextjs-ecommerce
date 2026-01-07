import { MultiSelect } from "@mantine/core";
import React from "react";

interface FlowMultiSelectInputProps {
  data: { label: string; value: string }[] | string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[];
  onChange: (value: unknown) => void;
  label: string;
  searchable?: boolean;
  disabled?: boolean;
}

const FlowMultiSelectInput = ({
  data,
  value,
  onChange,
  label,
  searchable = true,
  disabled = false,
}: FlowMultiSelectInputProps) => {
  return (
    <MultiSelect
      label={label}
      data={data}
      value={value}
      onChange={onChange}
      searchable={searchable}
      disabled={disabled}
      size="xs"
      clearable
      placeholder="Seçiniz..."
      checkIconPosition="right"
      maxValues={10}
      hidePickedOptions
    />
  );
};

export default FlowMultiSelectInput;
